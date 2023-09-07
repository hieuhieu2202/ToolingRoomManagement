const uploadArea = document.querySelector('#uploadArea');
const dropZoon = document.querySelector('#dropZoon');
const loadingText = document.querySelector('#loadingText');
const fileInput = document.querySelector('#fileInput');
const previewImage = document.querySelector('#previewImage');
const fileDetails = document.querySelector('#fileDetails');
const uploadedFile = document.querySelector('#uploadedFile');
const uploadedFileInfo = document.querySelector('#uploadedFileInfo');
const uploadedFileName = document.querySelector('.uploaded-file__name');
const uploadedFileIconText = document.querySelector('.uploaded-file__icon-text');
const uploadedFileCounter = document.querySelector('.uploaded-file__counter');
const uploadedFileClear = document.querySelector('.drop-zoon-close_icon');

var hasFile = false;

const fileTypes = [
    "application/vnd.ms-excel", // xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // xlsx
];

uploadedFileClear.addEventListener('click', function (e) {
    dropZoon.classList.remove('drop-zoon--Uploaded');
    loadingText.style.display = "none";
    previewImage.style.display = 'block';
    uploadedFile.classList.add('uploaded-file--open');
    uploadedFileInfo.classList.add('uploaded-file__info--active');

    
    uploadArea.classList.remove('upload-area--open');
    loadingText.style.display = "blobk";
    previewImage.style.display = 'none';
    fileDetails.classList.remove('file-details--open');
    uploadedFile.classList.remove('uploaded-file--open');
    uploadedFileInfo.classList.remove('uploaded-file__info--active');

    $('#fileInput').val('');


    e.target.files = [];
    e.stopPropagation();
    e.preventDefault();
});

dropZoon.addEventListener('dragover', function (event) {
    event.preventDefault();
    dropZoon.classList.add('drop-zoon--over');
});

dropZoon.addEventListener('dragleave', function (event) {
    event.preventDefault();
    dropZoon.classList.remove('drop-zoon--over');
});

dropZoon.addEventListener('drop', function (event) {
    event.preventDefault();
    dropZoon.classList.remove('drop-zoon--over');

    const file = event.dataTransfer.files[0];
   
    uploadFile(file);
    hasFile = true;
});

dropZoon.addEventListener('click', function (event) {
    fileInput.click();
});

fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    uploadFile(file);
    hasFile = true;
});

function uploadFile(file) {
    const fileReader = new FileReader();
    const fileType = file.type;
    const fileSize = file.size;

    if (fileValidate(fileType, fileSize)) {
        dropZoon.classList.add('drop-zoon--Uploaded');
        loadingText.style.display = "block";
        previewImage.style.display = 'none';
        uploadedFile.classList.remove('uploaded-file--open');
        uploadedFileInfo.classList.remove('uploaded-file__info--active');

        fileReader.addEventListener('load', function () {
            setTimeout(function () {
                uploadArea.classList.add('upload-area--open');
                loadingText.style.display = "none";
                previewImage.style.display = 'block';
                fileDetails.classList.add('file-details--open');
                uploadedFile.classList.add('uploaded-file--open');
                uploadedFileInfo.classList.add('uploaded-file__info--active');
            }, 500);

            uploadedFileName.innerHTML = file.name;
        });

        fileReader.readAsDataURL(file);
    }
};

function progressMove(counter) {
    uploadedFileCounter.innerHTML = `${counter}%`
    if (counter === 100) {
        clearInterval(counterIncrease);
    }
    //let counter = 0;
    //setTimeout(() => {
    //    let counterIncrease = setInterval(() => {
    //        if (counter === 100) {
    //            clearInterval(counterIncrease);
    //        } else {
    //            counter = counter + 10;
    //            uploadedFileCounter.innerHTML = `${counter}%`
    //        }
    //    }, 100);
    //}, 600);
};

function fileValidate(fileType, fileSize) {
    let isFile = fileTypes.includes(fileType);

    if (isFile) {
        if (fileSize <= 100000000) {
            return true;
        } else {
            Swal.fire(
                'Sorry, something went wrong!',
                'Please make sure your file is 100 Megabytes or less.',
                'error'
            );
            return false;
        }
    } else {
        Swal.fire(
            'Sorry, something went wrong!',
            'Please make sure to upload an Excel file (xls, xlsx).',
            'error'
        );
        return false;
    }
}
