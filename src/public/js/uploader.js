(function(d,w){
    let table_loader;
    let ScanButton, FileInput, DropContainer, SaveButton;
    let FileStash = [];

    // PENDIENTE
    // Verificacion de duplicidad/sobrescritura
    // Eliminacion
    // Descarga
    // Formato de Fecha
    // 

    d.addEventListener('DOMContentLoaded', ()=>{
        ScanButton = d.getElementById('scan-button');
        FileInput = d.getElementById('file-input');
        DropContainer = d.getElementById('drop-container');
        SaveButton = d.getElementById('save-btn');

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
            let files = this.files;
            FileProcess(files[0]);
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
        SaveButton.addEventListener('click', event => {
            if (FileStash.length > 0) {
                FileStash.forEach(async e => {                    
                    await FileUpload(e.id, e.file);
                });
                FilesRenderList();   
            }
        });
    });

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
                            <td>${ format(new Date(e.updated)) }</td>
                            <td>
                                <button class="file-btn btn-red">
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
        const ExtFilter = ['jpeg','jpg','png','txt','svg','gif','doc','xlsl'];
        if (!ExtFilter.includes(ext)) {
            console.log(`${file.name} is not valid.`);
            return;
        }
        const id = `file-${Math.random().toString(32).substring(7)}`;
        FileCreatePreview(id, {
            name: file.name,
            type: file.type,
            ext: ext
        });
        FileStash.push({
            id: id,
            file: file
        });
        
    }    
    function FileCreatePreview(id, file){
        let item_html = `
            <div id="${id}" class="progress-item">
                <div id="progress_${id}" class="progress-bar"></div>
                <div class="progress-item-data">
                    ${file.name.slice(0, 35) + (file.name.length > 35 ? "..." : "")} 
                    <span class="progress-tag file-${file.ext}">
                        ${file.ext}
                    </span>
                </div>
                <div class="progress-item-controls">
                    <a href="" class="progress-item-button button-text-danger">
                        <i class="lni lni-close"></i>
                    </a>
                </div>
            </div>
        `; 
        d.getElementById('progress-list').innerHTML += item_html;
    }
    function FileSetProgress(id, porcentual){
        try {
            let progress = d.getElementById(`progress_${id}`);
            console.log(progress)
            progress.classList.add(`wp-${porcentual}`);

        } catch (error) {
            
        }
    }
    async function FileUpload(id, file){
        try {
            FileSetProgress(id, 30);
            let data = new FormData();
            data.append('filex', file);

            let send = await fetch('http://localhost:3000/file-upload', {
                method: 'POST',
                body: data
            });
            setTimeout(() => {
                FileSetProgress(id, 100);
            }, 300);
            let response = await send.json();

            console.log(response);
        } catch (error) {
            console.log('Error: '+error.message);
            if (id) FileSetProgress(id, 0);
        }
    }

    function format (date) {  
        if (!(date instanceof Date)) {
          throw new Error('Invalid "date" argument. You must pass a date instance')
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