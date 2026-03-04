import{c as E,r as s,j as i,P as p,J as $,C as m,q as F,b as S}from"./index-f30EzvEF.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=E("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=E("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);var w={exports:{}},x={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d=s;function M(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var P=typeof Object.is=="function"?Object.is:M,D=d.useState,q=d.useEffect,T=d.useLayoutEffect,U=d.useDebugValue;function V(e,t){var a=t(),o=D({inst:{value:a,getSnapshot:t}}),n=o[0].inst,r=o[1];return T(function(){n.value=a,n.getSnapshot=t,v(n)&&r({inst:n})},[e,a,t]),q(function(){return v(n)&&r({inst:n}),e(function(){v(n)&&r({inst:n})})},[e]),U(a),a}function v(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!P(e,a)}catch{return!0}}function G(e,t){return t()}var H=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?G:V;x.useSyncExternalStore=d.useSyncExternalStore!==void 0?d.useSyncExternalStore:H;w.exports=x;var z=w.exports;function B(){return z.useSyncExternalStore(J,()=>!0,()=>!1)}function J(){return()=>{}}var g="Avatar",[K]=F(g),[O,A]=K(g),L=s.forwardRef((e,t)=>{const{__scopeAvatar:a,...o}=e,[n,r]=s.useState("idle");return i.jsx(O,{scope:a,imageLoadingStatus:n,onImageLoadingStatusChange:r,children:i.jsx(p.span,{...o,ref:t})})});L.displayName=g;var C="AvatarImage",b=s.forwardRef((e,t)=>{const{__scopeAvatar:a,src:o,onLoadingStatusChange:n=()=>{},...r}=e,l=A(C,a),u=W(o,r),c=$(f=>{n(f),l.onImageLoadingStatusChange(f)});return m(()=>{u!=="idle"&&c(u)},[u,c]),u==="loaded"?i.jsx(p.img,{...r,ref:t,src:o}):null});b.displayName=C;var I="AvatarFallback",N=s.forwardRef((e,t)=>{const{__scopeAvatar:a,delayMs:o,...n}=e,r=A(I,a),[l,u]=s.useState(o===void 0);return s.useEffect(()=>{if(o!==void 0){const c=window.setTimeout(()=>u(!0),o);return()=>window.clearTimeout(c)}},[o]),l&&r.imageLoadingStatus!=="loaded"?i.jsx(p.span,{...n,ref:t}):null});N.displayName=I;function y(e,t){return e?t?(e.src!==t&&(e.src=t),e.complete&&e.naturalWidth>0?"loaded":"loading"):"error":"idle"}function W(e,{referrerPolicy:t,crossOrigin:a}){const o=B(),n=s.useRef(null),r=o?(n.current||(n.current=new window.Image),n.current):null,[l,u]=s.useState(()=>y(r,e));return m(()=>{u(y(r,e))},[r,e]),m(()=>{const c=k=>()=>{u(k)};if(!r)return;const f=c("loaded"),h=c("error");return r.addEventListener("load",f),r.addEventListener("error",h),t&&(r.referrerPolicy=t),typeof a=="string"&&(r.crossOrigin=a),()=>{r.removeEventListener("load",f),r.removeEventListener("error",h)}},[r,a,t]),l}var R=L,j=b,_=N;const Q=s.forwardRef(({className:e,...t},a)=>i.jsx(R,{ref:a,className:S("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",e),...t}));Q.displayName=R.displayName;const X=s.forwardRef(({className:e,...t},a)=>i.jsx(j,{ref:a,className:S("aspect-square h-full w-full object-cover",e),...t}));X.displayName=j.displayName;const Y=s.forwardRef(({className:e,...t},a)=>i.jsx(_,{ref:a,className:S("flex h-full w-full items-center justify-center rounded-full bg-muted",e),...t}));Y.displayName=_.displayName;export{Q as A,ee as C,X as a,Y as b,te as c,z as s};
