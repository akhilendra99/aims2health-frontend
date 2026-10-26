// Keep analytics initialization in a same-origin script so it does not depend
// on an inline script block. The frontend CSP still needs an explicit,
// reviewed allowance for www.googletagmanager.com while this integration is used.
(function (window, document) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-VZQ7GNY9E3");

  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var firstScript = document.getElementsByTagName("script")[0];
  var tagManagerScript = document.createElement("script");
  tagManagerScript.async = true;
  tagManagerScript.src = "https://www.googletagmanager.com/gtm.js?id=GTM-5SVRLBXW";
  firstScript.parentNode.insertBefore(tagManagerScript, firstScript);
})(window, document);
