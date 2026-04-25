(function($) {
    'use strict';

    function handlePaste(e, inputField) {
        var items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                var file = items[i].getAsFile();
                var dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputField.files = dataTransfer.files;
                // показать превью
                var reader = new FileReader();
                reader.onload = function(event) {
                    var preview = inputField.closest('.form-row, td').querySelector('img');
                    if (preview) {
                        preview.src = event.target.result;
                    } else {
                        var img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.maxHeight = '100px';
                        img.style.marginTop = '8px';
                        inputField.parentNode.appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
                e.preventDefault();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Применяем ко всем file input полям
        document.querySelectorAll('input[type="file"]').forEach(function(input) {
            // Ctrl+V на странице
            document.addEventListener('paste', function(e) {
                if (document.activeElement === input || 
                    input.closest('.form-row, td')?.matches(':hover')) {
                    handlePaste(e, input);
                }
            });

            // Drag & Drop
            var dropZone = input.closest('.form-row, td') || input.parentNode;
            dropZone.style.border = '2px dashed transparent';
            dropZone.style.transition = 'border 0.3s';

            dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                dropZone.style.border = '2px dashed #79aec8';
                dropZone.style.borderRadius = '4px';
            });

            dropZone.addEventListener('dragleave', function() {
                dropZone.style.border = '2px dashed transparent';
            });

            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                dropZone.style.border = '2px dashed transparent';
                var files = e.dataTransfer.files;
                if (files.length && files[0].type.indexOf('image') !== -1) {
                    input.files = files;
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.maxHeight = '100px';
                        img.style.marginTop = '8px';
                        input.parentNode.appendChild(img);
                    };
                    reader.readAsDataURL(files[0]);
                }
            });
        });
    });
})(django.jQuery);
