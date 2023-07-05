particlesJS.load('particles-js', '/Content/vendor/Particles/particles.json', function () {
});
$(function () {
    let bgr = document.getElementById("particles-js");
    let numImg = Math.floor(Math.random() * 16) + 1;
    bgr.style.backgroundImage = "url('/Content/Image/Login/Backgrounds/" + numImg + ".jpg')";
});

