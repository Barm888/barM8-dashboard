// VALIDATION CODES
jQuery(document).ready(function(){	
	jQuery('.wpcf7-validates-as-required').addClass('required');
	jQuery('.wpcf7-email').addClass('email');
	jQuery('.wpcf7-checkbox.wpcf7-validates-as-required input').addClass('required');
	
	jQuery('form.wpcf7-form').each(function(){
		jQuery(this).addClass(jvcf7_invalid_field_design);
		jQuery(this).addClass(jvcf7_show_label_error);
		jQuery(this).validate();
	});	

	jQuery('.wpcf7-form-control.wpcf7-submit').click(function(e){ 
		$jvcfValidation 	=	jQuery(this).parents('form');
		if (!jQuery($jvcfValidation).valid()){
			e.preventDefault();
			$topErrorPosition 		= jQuery('.wpcf7-form-control.error').offset().top;
			$topErrorPosition		= parseInt($topErrorPosition) - 100;
			jQuery('body, html').animate({scrollTop:$topErrorPosition}, 'normal');
		}
	});
});


jQuery.validator.addMethod("email2", 
    function(value, element) {
        return /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(value);
    },"Please enter a valid email address"
);

jQuery.validator.addMethod("letters_space", function(value, element) {
  return this.optional(element) || /^[a-zA-Z ]*$/.test(value);
}, "Letters and space only");