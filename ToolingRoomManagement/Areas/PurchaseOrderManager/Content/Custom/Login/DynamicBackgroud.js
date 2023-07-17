particlesJS.load('particles-js', '/Areas/PurchaseOrderManager/Content/vendor/Particles/particles.json', function () {
});
$(function () {
    let bgr = document.getElementById("particles-js");
    let numImg = Math.floor(Math.random() * 16) + 1;
    bgr.style.backgroundImage = "url('/Areas/PurchaseOrderManager/Content/Image/Login/Backgrounds/" + numImg + ".jpg')";
});