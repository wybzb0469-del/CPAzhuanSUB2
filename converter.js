// Codex Key Management - Converter
class CKMConverter {
    constructor() {
        this.files = [];
        this.convertedData = null;
        this.init();
    }

    init() {
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('convertBtn').addEventListener('click', () => this.convert());
        document.getElementById('downloadBtn').addEventListener('click', () => this.download());
        document.getElementById('sourceFormat').addEventListener('change', () => { this.updateFormatHint(); this.updateOutputPreview(); this.updateStep(1); });
        document.getElementById('targetFormat').addEventListener('change', () => this.updateOutputPreview());
        document.getElementById('clearFilesBtn').addEventListener('click', () => this.clearFiles());
        
        // Drag and drop
        const dropZone = document.getElementById('dropZone');
        const uploadArea = dropZone.querySelector('.upload-area');
        
        uploadArea.addEventListener('click', (e) => {
            if (e.target.tagName !== 'LABEL') {
                document.getElementById('fileInput').click();
            }
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.json'));
            if (droppedFiles.length > 0) {
                this.files = [...this.files, ...droppedFiles];
                this.updateFileList();
                this.updateStep(2);
            }
        });
        
        this.updateFormatHint();
        this.updateOutputPreview();
        this.updateStep(1);
    }

    updateStep(activeStep) {
        document.querySelectorAll('.sidebar-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === activeStep);
        });
    }

    updateOutputPreview() {
        const targetFormat = document.getElementById('targetFormat').value;
        const outputType = document.getElementById('outputType');
        const outputFilename = document.getElementById('outputFilename');
        const formatMap = {
            cpa: { type: 'CPA ZIP', filename: 'cpa_accounts' },
            sub2api: { type: 'sub2api JSON', filename: 'sub2api_accounts' },
            cockpittools: { type: 'CockpitTools JSON', filename: 'cockpittools_accounts' },
            easyllm: { type: 'EasyLLM JSON', filename: 'easyllm-accounts' }
        };
        const config = formatMap[targetFormat];
        outputType.textContent = config.type;
        outputFilename.textContent = config.filename;
        
        // Update card badge
        const sourceFormat = document.getElementById('sourceFormat').value;
        const formatNames = { cpa: 'CPA', sub2api: 'sub2api', cockpittools: 'CockpitTools', easyllm: 'EasyLLM' };
        const cardBadge = document.querySelector('.card-badge');
        if (cardBadge) {
            cardBadge.textContent = `${formatNames[sourceFormat]} → ${formatNames[targetFormat]}`;
        }
    }

    updateFormatHint() {
        const sourceFormat = document.getElementById('sourceFormat').value;
        const hint = document.getElementById('formatHint');

        if (sourceFormat === 'cpa') {
            hint.classList.add('show');
        } else {
            hint.classList.remove('show');
        }
    }

    clearFiles() {
        this.files = [];
        document.getElementById('fileInput').value = '';
        this.updateFileList();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        const uploadArea = document.querySelector('.upload-area');
        const fileItems = fileList.querySelector('.file-items');
        const fileCount = fileList.querySelector('.file-count');

        if (this.files.length === 0) {
            fileList.style.display = 'none';
            uploadArea.style.display = 'flex';
            return;
        }

        fileList.style.display = 'block';
        uploadArea.style.display = 'none';
        fileCount.textContent = `已选择 ${this.files.length} 个文件`;
        
        fileItems.innerHTML = '';
        this.files.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.title = file.name;
            fileItems.appendChild(li);
        });
    }

    handleFileSelect(event) {
        const newFiles = Array.from(event.target.files);
        this.files = [...this.files, ...newFiles];
        this.updateFileList();
        this.updateStep(2);
        this.hideResult();
    }

    async convert() {
        if (this.files.length === 0) {
            this.showError('请先选择文件');
            return;
        }

        const sourceFormat = document.getElementById('sourceFormat').value;
        const targetFormat = document.getElementById('targetFormat').value;

        if (sourceFormat === targetFormat) {
            this.showError('源格式和目标格式不能相同');
            return;
        }

        this.updateStep(4);

        const convertBtn = document.getElementById('convertBtn');
        const btnText = convertBtn.querySelector('.btn-text');
        const btnLoading = convertBtn.querySelector('.btn-loading');

        try {
            this.hideError();
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            convertBtn.disabled = true;

            const accounts = await this.parseFiles(sourceFormat);
            this.convertedData = this.convertToFormat(accounts, targetFormat);
            this.showResult(accounts.length, targetFormat);
        } catch (error) {
            this.showError(`转换失败: ${error.message}`);
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            convertBtn.disabled = false;
        }
    }

    async parseFiles(format) {
        const accounts = [];
        
        for (const file of this.files) {
            const content = await this.readFile(file);
            const parsed = JSON.parse(content);
            
            switch (format) {
                case 'cpa':
                    accounts.push(this.parseCPA(parsed));
                    break;
                case 'sub2api':
                    accounts.push(...this.parseSub2api(parsed));
                    break;
                case 'cockpittools':
                    accounts.push(...this.parseCockpitTools(parsed));
                    break;
                case 'easyllm':
                    accounts.push(...this.parseEasyLLM(parsed));
                    break;
            }
        }
        
        return accounts;
    }

    parseCPA(data) {
        return {
            email: data.email,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            id_token: data.id_token,
            account_id: data.account_id,
            expired: data.expired,
            last_refresh: data.last_refresh,
            type: data.type || 'codex'
        };
    }

    parseSub2api(data) {
        return data.accounts.map(acc => ({
            email: acc.credentials.email,
            access_token: acc.credentials.access_token,
            refresh_token: acc.credentials.refresh_token,
            id_token: acc.credentials.id_token,
            account_id: acc.credentials.chatgpt_account_id,
            expired: acc.credentials.expires_at,
            last_refresh: new Date().toISOString(),
            type: acc.type
        }));
    }

    parseCockpitTools(data) {
        if (!Array.isArray(data)) {
            throw new Error('CockpitTools 格式应为数组');
        }
        
        return data.map(acc => ({
            email: acc.email,
            access_token: acc.tokens.access_token,
            refresh_token: acc.tokens.refresh_token,
            id_token: acc.tokens.id_token,
            account_id: acc.id.replace('codex_', ''),
            expired: new Date(acc.created_at * 1000 + 864000000).toISOString(),
            last_refresh: new Date(acc.last_used * 1000).toISOString(),
            type: 'codex'
        }));
    }

    parseEasyLLM(data) {
        return data.oauth_accounts.map(acc => ({
            email: acc.email,
            access_token: acc.access_token,
            refresh_token: acc.refresh_token,
            id_token: acc.id_token,
            account_id: acc.account_id,
            expired: acc.expired,
            last_refresh: acc.last_refresh,
            type: acc.type,
            status: acc.status,
            disabled: acc.disabled
        }));
    }

    convertToFormat(accounts, format) {
        switch (format) {
            case 'cpa':
                return this.toCPA(accounts);
            case 'sub2api':
                return this.toSub2api(accounts);
            case 'cockpittools':
                return this.toCockpitTools(accounts);
            case 'easyllm':
                return this.toEasyLLM(accounts);
        }
    }

    toCPA(accounts) {
        return accounts.map(acc => ({
            id_token: acc.id_token,
            access_token: acc.access_token,
            refresh_token: acc.refresh_token,
            account_id: acc.account_id,
            last_refresh: acc.last_refresh || new Date().toISOString(),
            email: acc.email,
            type: acc.type || 'codex',
            expired: acc.expired
        }));
    }

    toSub2api(accounts) {
        return {
            exported_at: new Date().toISOString(),
            proxies: [],
            accounts: accounts.map(acc => {
                const tokenVersion = acc.last_refresh ? 
                    new Date(acc.last_refresh).getTime() : 
                    Date.now();
                
                return {
                    name: acc.email,
                    platform: "openai",
                    type: "oauth",
                    credentials: {
                        _token_version: tokenVersion,
                        access_token: acc.access_token,
                        chatgpt_account_id: acc.account_id,
                        chatgpt_user_id: this.extractUserId(acc.access_token),
                        email: acc.email,
                        expires_at: acc.expired,
                        expires_in: 864000,
                        id_token: acc.id_token,
                        organization_id: this.extractOrgId(acc.id_token),
                        refresh_token: acc.refresh_token
                    },
                    extra: {
                        email: acc.email
                    },
                    concurrency: 10,
                    priority: 1,
                    rate_multiplier: 1,
                    auto_pause_on_expired: true
                };
            })
        };
    }

    toCockpitTools(accounts) {
        return accounts.map(acc => ({
            id: `codex_${acc.account_id}`,
            email: acc.email,
            tokens: {
                id_token: acc.id_token,
                access_token: acc.access_token,
                refresh_token: acc.refresh_token
            },
            created_at: Math.floor(new Date(acc.last_refresh || Date.now()).getTime() / 1000),
            last_used: Math.floor(Date.now() / 1000)
        }));
    }

    toEasyLLM(accounts) {
        return {
            exported_at: new Date().toISOString(),
            _usage: "恢复时：在「批量导入 → 从备份导入」中上传此文件即可一键恢复所有账号，无需任何 API 调用。oauth_accounts 每条为 Codex 风格字段（account_id、expired、disabled、last_refresh、type 等）。仍兼容旧版 chatgpt_account_id / expires_at。请妥善保管此文件。",
            oauth_accounts: accounts.map(acc => ({
                access_token: acc.access_token,
                account_id: acc.account_id,
                disabled: acc.disabled || false,
                email: acc.email,
                expired: acc.expired,
                id_token: acc.id_token,
                last_refresh: acc.last_refresh || new Date().toISOString(),
                refresh_token: acc.refresh_token,
                type: acc.type || 'codex',
                status: acc.status || 'active'
            })),
            api_accounts: null
        };
    }

    extractUserId(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload['https://api.openai.com/auth']?.chatgpt_user_id || 'unknown';
        } catch {
            return 'unknown';
        }
    }

    extractOrgId(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const orgs = payload['https://api.openai.com/auth']?.organizations || [];
            return orgs.find(o => o.is_default)?.id || 'unknown';
        } catch {
            return 'unknown';
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    showResult(count, format) {
        const formatNames = {
            cpa: 'CPA',
            sub2api: 'sub2api',
            cockpittools: 'CockpitTools',
            easyllm: 'EasyLLM'
        };

        document.getElementById('resultInfo').innerHTML = `
            <p>成功将 ${count} 个账号转换为 <strong>${formatNames[format]}</strong> 格式</p>
            <div class="result-stats">
                <div class="result-stat">
                    <span class="result-stat-value">${count}</span>
                    <span class="result-stat-label">账号数量</span>
                </div>
                <div class="result-stat">
                    <span class="result-stat-value">${formatNames[format]}</span>
                    <span class="result-stat-label">目标格式</span>
                </div>
            </div>
        `;
        document.getElementById('result').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        
        // Scroll to result
        document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showError(message) {
        document.getElementById('errorMsg').textContent = message;
        document.getElementById('error').style.display = 'block';
        document.getElementById('result').style.display = 'none';
        
        // Scroll to error
        document.getElementById('error').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    hideResult() {
        document.getElementById('result').style.display = 'none';
    }

    async download() {
        const targetFormat = document.getElementById('targetFormat').value;
        const data = this.convertedData;
        const timestamp = Date.now();
        
        if (targetFormat === 'cpa') {
            // CPA 格式：打包成 zip 文件
            await this.downloadCPAZip(data, timestamp);
        } else {
            // 其他格式：单个文件
            const filenames = {
                sub2api: `sub2api_accounts-${timestamp}.json`,
                cockpittools: `cockpittools_accounts-${timestamp}.json`,
                easyllm: `easyllm-accounts-${timestamp}.json`
            };
            this.downloadFile(filenames[targetFormat], JSON.stringify(data, null, 2));
        }
    }

    async downloadCPAZip(accounts, timestamp) {
        if (typeof JSZip === 'undefined') {
            this.showError('JSZip 库未加载，无法创建压缩包');
            return;
        }

        const zip = new JSZip();
        const cpaFolder = zip.folder('CPA');
        
        // 将每个账号添加到 CPA 文件夹
        accounts.forEach((acc) => {
            const emailPart = acc.email.replace('@', '+').split('+')[0];
            const filename = `token_${emailPart}_${timestamp}.json`;
            cpaFolder.file(filename, JSON.stringify(acc, null, 2));
        });

        // 生成 zip 文件并下载
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CPA_accounts-${timestamp}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            this.showError(`创建压缩包失败: ${error.message}`);
        }
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 初始化
new CKMConverter();
