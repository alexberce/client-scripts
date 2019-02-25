jQuery(document).ready(function(){
  setTimeout(() => {
    for(let i=0; i < 10; i++)
      jQuery("[data-role="add-group-button"]").click();
  }, 10);
});