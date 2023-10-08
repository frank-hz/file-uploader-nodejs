(function(d,w){
    let table_loader;
    let ScanButton, FileInput, DropContainer, SaveButton, FormLog, ProgressList;
    let FileStash = [];

    d.addEventListener('DOMContentLoaded', ()=>{
        ScanButton = d.getElementById('scan-button');
        FileInput = d.getElementById('file-input');
        DropContainer = d.getElementById('drop-container');
        SaveButton = d.getElementById('save-btn');
        ProgressList = d.getElementById('progress-list');
        FormLog = d.getElementById('form-log');
        

        table_loader = d.getElementById('table_loading');
        FilesRenderList();   
        
        
        ScanButton.addEventListener('click', event => {
            FilesRenderList();
        });
        DropContainer.addEventListener('click', (event) => {
            let ev = event.target;
            FileInput.click();
        });
        FileInput.addEventListener('change', function(){
            let files_ = this.files;
            if (files_.length === undefined) {
                FileProcess(files_);
            }else {
                for (const file of files_) {
                    FileProcess(file);
                }
            }
        }, false);
        DropContainer.addEventListener('dragover', event => {
            event.preventDefault();
            DropContainer.classList.add('actived'); 
    
        });
        DropContainer.addEventListener('dragleave', event => {
            event.preventDefault();
            DropContainer.classList.remove('actived'); 
            
        });
        DropContainer.addEventListener('drop', event => {
            event.preventDefault();
            let files_ = event.dataTransfer.files;
            
            if (files_.length === undefined) {
                FileProcess(files_);
            }else {
                for (const file of files_) {
                    FileProcess(file);
                }
            }
            DropContainer.classList.remove('actived'); 
            
        });
        SaveButton.addEventListener('click', async event => {
            if (FileStash.length > 0){       
                let FileResiduary = [];       
                for (let j = 0; j < FileStash.length; j++) {
                    if (await FileUpload(FileStash[j].id, FileStash[j].file)) {
                        await new Promise((resolve,reject) => {
                            FileStash[j].status = 'ok';
                            FileProgressUpdate(FileStash[j].id,{
                                update: true, progress: 100
                            });
                            setTimeout(() => {
                                FileProgressUpdate(FileStash[j].id, {remove: true});       
                                resolve();                    
                            }, 300);
                        })                            
                        
                    }else {
                        FileResiduary.push(FileStash[j]);
                        FileProgressUpdate(FileStash[j].id,{
                            update: true,
                            error: true,
                            progress: 0
                        });
                    }                     
                }
                FileStash = FileResiduary;
                FormLog.innerHTML = FileStash.length+' items'; 
                FilesRenderList();
            }            
        });
    });
    d.addEventListener('click', event => {
        if (event.target.matches('[name=delete-item]')){
            if (confirm('¿remover archivo?')){
                FileRemove(event.target.dataset.name);
            }
        }
    })

    async function FilesRenderList(){
        try {
            table_loader.classList.add('loading-down');
            let req = await fetch('http://localhost:3000/files-get-all', {
                method: 'GET'
            });
            let data = await req.json();
            let html = `
                <tr>
                    <td colspan="5">Archivos no encontrados.</td>
                </tr>
            `;
            if (data.length > 0) {
                html = '';
                data.forEach(e => {
                    html+= `
                        <tr>
                            <td>${e.name}</td>
                            <td>
                                <span class="file-tag file-${ e.ext.replace(".","")}">${e.ext}</span>
                            </td>
                            <td>${e.size_rps}</td>
                            <td>${ dateFormat(new Date(e.updated)) }</td>
                            <td>
                                <button name="delete-item" class="file-btn btn-red" data-name="${e.name}">
                                    <i class="lni lni-cross-circle"></i>
                                    Remove
                                </button>
                                <a href="${e.url}" target="_blank" class="file-btn btn-purple">
                                    <i class="lni lni-download"></i>
                                    Download
                                </a>
                            </td>
                        </tr>
                    `;
                });
            }
            d.getElementById('storage-dataset').innerHTML = html;
            setTimeout(() => {
                table_loader.classList.remove('loading-down');
            }, 100);
        } catch (error) {
            table_loader.classList.remove('loading-down');
        }
    }
    function FileProcess(file){
        let ext = file.name.split('.').pop();
        const ExtFilter = ['jpeg','jpg','png','txt','svg','gif','doc','xlsl','svg'];
        if (!ExtFilter.includes(ext)) {
            console.log(`${file.name} is not valid.`);
            return;
        }
        const id = `file-${Math.random().toString(32).substring(7)}`;
        FileProgressCreate(id,{
            name: file.name,
            type: file.type,
            ext: ext
        });
        FileStash.push({
            id: id,
            file: file
        });
        FormLog.innerHTML = FileStash.length+' items';        
    }    
    function FileProgressCreate(id, file){
        let item_html = `
            <div id="${id}" class="progress-item">
                <div class="progress-bar"></div>
                <div class="progress-item-data">
                    ${file.name.slice(0, 35) + (file.name.length > 35 ? "..." : "")} 
                    <span class="progress-tag file-${file.ext}">
                        ${file.ext}
                    </span>
                    <div class="progress-item-log"></div>
                </div>
                <div class="progress-item-controls">
                    <a href="" class="progress-item-button button-text-danger">
                        <i class="lni lni-close"></i>
                    </a>
                </div>
            </div>
        `; 
        ProgressList.innerHTML += item_html;
    }
    function FileProgressUpdate(id, st = {}){
        try {
            if (!id || id == undefined) return;            
            let item = d.getElementById(id);
            let progress = item.querySelector('.progress-bar');
            let log = item.querySelector('.progress-item-log');
            log.innerHTML = '';

            if (st.update) progress.style.width = `${st.progress}%`;
            if (st.remove) item.remove();
            if (st.error) log.innerHTML = 'error';
        } catch (error) {
            console.log('[error] '+error.message);
        }
    }
    async function FileUpload(id, file){
        try {
            FileProgressUpdate(id, {update: true, progress: 30});
            let data = new FormData();
            data.append('filex', file);

            let send = await fetch('http://localhost:3000/file-upload', {
                method: 'POST',
                body: data
            });            
            FileProgressUpdate(id, {update: true, progress: 70});
            let res = await send.json(); 
            return res.ok ? res.ok : false;

            // 4Test
            // let rnd = Math.floor(Math.random() * 11);
            // return (rnd%2==0) ? true : false;
        } catch (error) {
            console.log('[error] '+error.message);            
            return;
        }
    }
    async function FileRemove(name){
        try {
            let data = new FormData();
            data.append('name',name);
            let remove = await fetch('http://localhost:3000/file-remove', {
                method: 'DELETE',
                body: data
            });
            let resp = await remove.json();
            if (resp.ok){
                alert(resp.ok);
                FilesRenderList();
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    function dateFormat (date) {  
        if (!(date instanceof Date)) {
          throw new Error('fecha invalida');
        }      
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
      
        return `${day}-${month}-${year}`
      }

    // 
    function FilePreview(file){
        const extension_filter = ['image/jpeg','image/jpg','image/png',"text/plain"];
        if (extension_filter.includes(file.type)) {
            const fileReader = new FileReader();
            const id = `file-${Math.random().toString(32).substring(7)}`;
            fileReader.addEventListener('load', event => {
                const fileURL = fileReader.result;
                const file = `
                    <div id="${id}">
                        <img src="${fileURL}" alt="${file.name}" width="50%">
                    </div>
                `;
                const preview = d.getElementById('preview_area');
                preview.innerHTML = image;
            });
            fileReader.readAsDataURL(file);
        }
    }
})(document,window);