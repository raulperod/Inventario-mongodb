$(document).ready(function ($) {
  // trigger event when button is clicked
  $("button.add").click(function () {
      // add new row to table using addTableRow function
      addTableRow($("table"));
      // prevent button redirecting to new page
      return false;

  });

  // function to add a new row to a table by cloning the last row and
  // incrementing the name and id values by 1 to make them unique
  function addTableRow(table) {

      // clone the last row in the table
      var $tr = $(table).find("tbody tr:last").clone();

      // get the name attribute for the input and select fields
      $tr.find("input,select").attr("name", function () {
          // break the field name and it's number into two parts
          var parts = this.id.match(/(\D+)(\d+)$/);
          // create a unique name for the new field by incrementing
          // the number for the previous field by 1
          return parts[1] + ++parts[2];

          // repeat for id attributes
      }).attr("id", function () {
          var parts = this.id.match(/(\D+)(\d+)$/);
          return parts[1] + ++parts[2];
      });
      // append the new row to the table
      $(table).find("tbody tr:last").after($tr);
      $tr.hide().fadeIn('slow');

      // row count
      rowCount = 0;
      $("#table tr td:first-child").text(function () {
          return ++rowCount;
      });

      // remove rows
      $(".remove_button").on("click", function () {
          if ( $('#table tbody tr').length == 1) return;
          $(this).parents("tr").fadeOut('slow', function () {
              $(this).remove();
              rowCount = 0;
              $("#table tr td:first-child").text(function () {
                  return ++rowCount;
              });
          });
      });

  };
});     
