import{_ as a}from"./launch-gate.js";import{c as n}from"./runtime.js";const d=document.getElementById("gos-mount"),t=n({parent:d,title:"Frontier Trail",mode:"canvas2d",logicalWidth:960,logicalHeight:540,assetBase:typeof window<"u"&&window.__GOS_ASSET_BASE||"./",backHref:typeof window<"u"&&window.__GOS_ARCADE_HREF||new URL("../../",window.location.href).href,hideRuntimeCanvas:!0,gameOwnsPause:!0,fillSmallScreens:!0});t.host.innerHTML=`
  <div id="ft-root">
    <canvas id="ft-view" width="960" height="540" role="img" aria-label="The trail"></canvas>
    <div id="ft-ui" class="layer interactive"></div>
    <div id="ft-fade" class="fade"></div>
  </div>
`;t.setLoading(!0,"Hitching the wagon…");const o=document.querySelector(".gos-loading");o&&o.classList.add("ft-hero-load");window.addEventListener("error",()=>t.setLoading(!1));a(()=>import("./game.js"),[],import.meta.url).then(()=>{const e=window.setInterval(()=>{var i;(i=document.getElementById("ft-view"))!=null&&i.getContext("2d")&&(window.clearInterval(e),window.setTimeout(()=>t.setLoading(!1),400))},50);window.setTimeout(()=>t.setLoading(!1),8e3)}).catch(e=>{t.setError(e&&(e.stack||e.message)||e)});
