var xhrFetchingImages;

wysiHelpers = {
  getImageTemplate: function() {
    /* this is what goes in the wysiwyg content after the image has been chosen */
    var tmpl;
    var imgEntry = "";
    tmpl = _.template("<div class='image-zoom-container'><img src='<%= url %>' alt='<%= caption %>' style='max-width:99%;'/><div class='mask'></div><b class='zoom-action-button' en-zoom='<%= url %>'><i class='icon icon-zoom-in'></i></b></div>");
    return tmpl;
  }
};

bootWysiOverrides = {
  initInsertImage: function(toolbar) {
    var self = this;
    var insertImageModal = toolbar.find('.bootstrap-wysihtml5-insert-image-modal');
    var urlInput = insertImageModal.find('.bootstrap-wysihtml5-insert-image-url');
    var insertButton = insertImageModal.find('button.image-upload-button');
    var cancelButton = insertImageModal.find('button.image-cancel-button');
    var fileNameLabel = insertImageModal.find('p.choosed_file_name');
    var initialValue = urlInput.val();
    
    var helpers = wysiHelpers;
    
    var insertImage = function(imageData) {
      if(imageData.url) {
        var clz = 'image_container';
        var doc = self.editor.composer.doc;
        var tmpl = helpers.getImageTemplate();
        var chunk = tmpl(imageData);
        self.editor.currentView.element.focus();
        console.log(self.editor.currentView.element);
        // self.editor.currentView.sandbox.iframe.contentDocument.body.focus();
        self.editor.composer.commands.exec("insertHTML", chunk);
      }
    };
    
    insertImageModal.on('hide', function() {
      self.editor.currentView.element.focus();
    });
    
    toolbar.find('a[data-wysihtml5-command=insertImage]').click(function() {
      var activeButton = $(this).hasClass("wysihtml5-command-active");
      var choosed_file = null;
      if (!activeButton) {
        insertImageModal.modal('show');

        var file_input = toolbar.find('.bootstrap-wysihtml5-insert-image-modal .insert-image-file-input');
        file_input.replaceWith(file_input.val('').clone(true));
        file_input = toolbar.find('.bootstrap-wysihtml5-insert-image-modal .insert-image-file-input');

        self.editor.currentView.element.focus(false);

        $('.clear_file_btn').on('click',function(evt){
          evt.preventDefault();
          choosed_file = null;
          fileNameLabel.text('')
        });

        function attach_change_event(){
          file_input.off('change').change(function(evt) {
            // upload evt.target.files[0] to binary
            console.log('file change triggered...');
            choosed_file = evt.target.files[0];
            if (!choosed_file) {
              return false;
            };
            // set name and show clear button
            fileNameLabel.text(choosed_file.name)

            evt.stopPropagation();
            return false;
          });
        }

        attach_change_event()

        insertButton.off("click").on('click',function(evt){
          // check if the input is right or not
          var url = toolbar.find('.image-url-input').val();
          toolbar.find('.image-url-input').val('');
          if (url&& url !='http://') {
            insertImage({
              url : url,
              caption: ''
            });

            insertImageModal.modal('hide'); 
            // hide mask 
            insertImageModal.parents('.nimbus_form_modal').find('.insert-image-mask').remove();
            fileNameLabel.text('')

            clear_file_input();
          }else if(choosed_file){
            upload_image(choosed_file)
          };

          // upload the image 
          evt.stopPropagation();
          return false;
        });

        $('button.close').on('click', function(){
          // hide mask
          insertImageModal.parents('.nimbus_form_modal').find('.insert-image-mask').remove();
          choosed_file = null;
          fileNameLabel.text('');

          clear_file_input();
        })

        function clear_file_input(){
          file_input.replaceWith(file_input.val('').clone(true));
          file_input = toolbar.find('.bootstrap-wysihtml5-insert-image-modal .insert-image-file-input');
          // attache the change event for new dom
          attach_change_event()
        }

        cancelButton.on('click', function(){
          choosed_file = null;
          fileNameLabel.text('')
        });

        var upload_image = function(file){
          toolbar.find('.uploadresult').html('Uploading File.').addClass('alert alert-info');

          // disable the insert button
          insertButton.attr('disabled',true);
          insertButton.attr('disabled',true);
          Nimbus.Binary.upload_file(file, function(file){
            if(file){
              // save file into foundry
              foundry._plugins.document.set(file._file.id, file._file);

              foundry.set_file_public(file._file.id);
              $('.uploadresult').html('Upload Complete').removeClass('alert-info').addClass('alert-success');
              // insert image
              insertImage({url:file.directlink,caption:file.name,id:file._file.id});
              insertImageModal.modal('hide');

              // hide mask
              insertImageModal.parents('.nimbus_form_modal').find('.insert-image-mask').remove();
            }else{
              $('.uploadresult').html('Upload failed').removeClass('alert-info').addClass('alert-error');
            } 
            insertButton.attr('disabled',false);
            cancelButton.attr('disabled',false);
            $('.uploadresult').html('').removeClass().addClass('uploadresult');
            fileNameLabel.text('')
            
            clear_file_input();
          });
        }

        insertImageModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(e) {
          // hide mask

          insertImageModal.parents('.nimbus_form_modal').find('.insert-image-mask').remove();

          choosed_file = null;
          fileNameLabel.text('')
          e.stopPropagation();
        });
        
        // insert mask
        insertImageModal.parents('.nimbus_form_modal').prepend('<div class="modal-backdrop fade in insert-image-mask"></div>');

        return false;
      }else {
        return true;
      }
    });
  }
};

$.extend($.fn.wysihtml5.Constructor.prototype, bootWysiOverrides);

$(function() {

  // override options
  var wysiwygOptions = {
    customTags: {
      "em": {},
      "strong": {},
      "hr": {}
    },
    customStyles: {
      // keys with null are used to preserve items with these classes, but not show them in the styles dropdown
      'shrink_wrap': null,
      'credit': null,
      'tombstone': null,
      'chat': null,
      'caption': null
    },
    customTemplates: {
      /* this is the template for the image button in the toolbar */
      image: function(locale) {
        return "<li class='editor-image-upload-modal'>" +
          "<div class='bootstrap-wysihtml5-insert-image-modal nimbus_confirm_modal modal hide fade'>" +
          "<div class='modal-header'>" +
          "<h3>" + locale.image.insert + "</h3>" +
          "</div>" +
          "<div class='modal-body'>" +
          '<ul class="nav nav-tabs" id="myTab">'+
            '<li class="active" style="width:50%"><a href=".home-tab" data-toggle="tab">From Computer</a></li>'+
            '<li style="width:50%"><a href=".profile-tab" data-toggle="tab">Image Url</a></li>'+
          '</ul>'+
          '<div class="tab-content">'+
            '<div class="tab-pane active home-tab">'+
              "<div class='chooser_wrapper'>" +
              '<span class="btn outline btn-file" style="padding:6px 13px;width: auto;height: auto;cursor: pointer;border-radius: 5px;">'+
                '<span class="fileupload-new">Choose File</span>'+
                "<input type='file' class='insert-image-file-input' style='width:100%'>"+
              '</span>'+
              '<span class="btn btn-danger clear_file_btn" style="height: 22px;width: auto;margin-left: 10px!important;">Clear</span>'+
              '<p class="choosed_file_name"></p>'+
              "<div class=\"uploadresult\"></div>" +
              "</div>" +
            '</div>'+
            '<div class="tab-pane profile-tab">'+
              "<input value='http://' class='image-url-input' style='width:100%;' class='bootstrap-wysihtml5-insert-image-url input-xlarge'>" +
            '</div>'+
          '</div>'+
          "</div>" +
          "<div class='modal-footer' style='padding:0'>" +
            "<button class='btn btn-danger image-cancel-button' data-dismiss='modal'>" + locale.image.cancel + "</button>" +
            "<button class='btn btn-primary image-upload-button' style='float: left;' title='" + locale.image.insert + "'>"+locale.image.insert+" <i class='icon-picture'></i></button>" +
          "</div>" +
          "</div>" +"<a class='btn' data-wysihtml5-command='insertImage' title='" + locale.image.insert + "'><i class='icon-picture'></i></a>" +
          "</li>";
      }
    }
  };

  foundry.wysiwygOptions = wysiwygOptions;
  $('.tip').tooltip();
  $('textarea.wysi').each(function() {
    $(this).wysihtml5($.extend(wysiwygOptions, {html:true, color:false, stylesheets:[]}));
  });
});
