// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
//Upload Function
function upLoadfile() {
    debugger
    var imgmaterials = $("#list_materials").get(0).files;
    var imgBOM_file = $("#BOM_file").get(0).files;

    var data = new FormData;
    data.append("list_materials_file", imgmaterials[0]);
    data.append("BOM_file", imgBOM_file[0]);
    var demand = parseInt($("#demand").val());
    var stepIDparesInt = parseInt(stepID);
    data.append("demand", demand);
    data.append("stepID", stepIDparesInt);

    $.ajax({

        type: "Post",
        url: "/Project/Create_Material4",
        data: data,
        contentType: false,
        processData: false,
        success: function (response) {

            debugger
            //console.log("@ViewBag.Message");
            alert("Update SUCCESS!");
            modal.style.display = "none";

            //Remove data of Modal
            $("#list_materials").val("");
            $("#BOM_file").val("");
            $("#demand").val("");

            //Reload Data
            $('#alpha_id').load('/MaterialsRDPM/LoadAlphaMaterial')
            $('#beta1_id').load('/MaterialsRDPM/LoadBeta1Material')
            $('#pilot_id').load('/MaterialsRDPM/LoadPilotMaterial')
            $('#1stpm_id').load('/MaterialsRDPM/Load1STMPMaterial')
        },
        error: function (err) {
            debugger
            alert("Update FAIL!"); 
        }
    })
}