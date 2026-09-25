import{o as ol}from"./vendor-core-D3eya0eI.js";const al=()=>{};var Ei={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mo=function(n){const t=[];let e=0;for(let s=0;s<n.length;s++){let i=n.charCodeAt(s);i<128?t[e++]=i:i<2048?(t[e++]=i>>6|192,t[e++]=i&63|128):(i&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++s)&1023),t[e++]=i>>18|240,t[e++]=i>>12&63|128,t[e++]=i>>6&63|128,t[e++]=i&63|128):(t[e++]=i>>12|224,t[e++]=i>>6&63|128,t[e++]=i&63|128)}return t},ll=function(n){const t=[];let e=0,s=0;for(;e<n.length;){const i=n[e++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){const a=n[e++];t[s++]=String.fromCharCode((i&31)<<6|a&63)}else if(i>239&&i<365){const a=n[e++],u=n[e++],h=n[e++],p=((i&7)<<18|(a&63)<<12|(u&63)<<6|h&63)-65536;t[s++]=String.fromCharCode(55296+(p>>10)),t[s++]=String.fromCharCode(56320+(p&1023))}else{const a=n[e++],u=n[e++];t[s++]=String.fromCharCode((i&15)<<12|(a&63)<<6|u&63)}}return t.join("")},go={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,t){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<n.length;i+=3){const a=n[i],u=i+1<n.length,h=u?n[i+1]:0,p=i+2<n.length,g=p?n[i+2]:0,A=a>>2,w=(a&3)<<4|h>>4;let V=(h&15)<<2|g>>6,b=g&63;p||(b=64,u||(V=64)),s.push(e[A],e[w],e[V],e[b])}return s.join("")},encodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(n):this.encodeByteArray(mo(n),t)},decodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(n):ll(this.decodeStringToByteArray(n,t))},decodeStringToByteArray(n,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<n.length;){const a=e[n.charAt(i++)],h=i<n.length?e[n.charAt(i)]:0;++i;const g=i<n.length?e[n.charAt(i)]:64;++i;const w=i<n.length?e[n.charAt(i)]:64;if(++i,a==null||h==null||g==null||w==null)throw new ul;const V=a<<2|h>>4;if(s.push(V),g!==64){const b=h<<4&240|g>>2;if(s.push(b),w!==64){const N=g<<6&192|w;s.push(N)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class ul extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const cl=function(n){const t=mo(n);return go.encodeByteArray(t,!0)},_o=function(n){return cl(n).replace(/\./g,"")},hl=function(n){try{return go.decodeString(n,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fl(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dl=()=>fl().__FIREBASE_DEFAULTS__,pl=()=>{if(typeof process>"u"||typeof Ei>"u")return;const n=Ei.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ml=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=n&&hl(n[1]);return t&&JSON.parse(t)},gl=()=>{try{return al()||dl()||pl()||ml()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _l(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function yl(){const n=gl()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function El(){return!yl()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Tl(){try{return typeof indexedDB=="object"}catch{return!1}}function vl(){return new Promise((n,t)=>{try{let e=!0;const s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),e||self.indexedDB.deleteDatabase(s),n(!0)},i.onupgradeneeded=()=>{e=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(e){t(e)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Al="FirebaseError";class Ee extends Error{constructor(t,e,s){super(e),this.code=t,this.customData=s,this.name=Al,Object.setPrototypeOf(this,Ee.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,yo.prototype.create)}}class yo{constructor(t,e,s){this.service=t,this.serviceName=e,this.errors=s}create(t,...e){const s=e[0]||{},i=`${this.service}/${t}`,a=this.errors[t],u=a?Il(a,s):"Error",h=`${this.serviceName}: ${u} (${i}).`;return new Ee(i,h,s)}}function Il(n,t){return n.replace(wl,(e,s)=>{const i=t[s];return i!=null?String(i):`<${s}?>`})}const wl=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xn(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rl(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}class kn{constructor(t,e,s){this.name=t,this.instanceFactory=e,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var U;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(U||(U={}));const Sl={debug:U.DEBUG,verbose:U.VERBOSE,info:U.INFO,warn:U.WARN,error:U.ERROR,silent:U.SILENT},Pl=U.INFO,Vl={[U.DEBUG]:"log",[U.VERBOSE]:"log",[U.INFO]:"info",[U.WARN]:"warn",[U.ERROR]:"error"},Cl=(n,t,...e)=>{if(t<n.logLevel)return;const s=new Date().toISOString(),i=Vl[t];if(i)console[i](`[${s}]  ${n.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class Eo{constructor(t){this.name=t,this._logLevel=Pl,this._logHandler=Cl,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in U))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Sl[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,U.DEBUG,...t),this._logHandler(this,U.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,U.VERBOSE,...t),this._logHandler(this,U.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,U.INFO,...t),this._logHandler(this,U.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,U.WARN,...t),this._logHandler(this,U.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,U.ERROR,...t),this._logHandler(this,U.ERROR,...t)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bl{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(Dl(e)){const s=e.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(e=>e).join(" ")}}function Dl(n){return n.getComponent()?.type==="VERSION"}const xr="@firebase/app",Ti="0.14.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xt=new Eo("@firebase/app"),Nl="@firebase/app-compat",Ol="@firebase/analytics-compat",xl="@firebase/analytics",kl="@firebase/app-check-compat",Ml="@firebase/app-check",Ll="@firebase/auth",Fl="@firebase/auth-compat",Ul="@firebase/database",Bl="@firebase/data-connect",jl="@firebase/database-compat",$l="@firebase/functions",ql="@firebase/functions-compat",Hl="@firebase/installations",Gl="@firebase/installations-compat",zl="@firebase/messaging",Kl="@firebase/messaging-compat",Ql="@firebase/performance",Wl="@firebase/performance-compat",Xl="@firebase/remote-config",Jl="@firebase/remote-config-compat",Yl="@firebase/storage",Zl="@firebase/storage-compat",tu="@firebase/firestore",eu="@firebase/ai",nu="@firebase/firestore-compat",ru="firebase",su="12.14.0",iu={[xr]:"fire-core",[Nl]:"fire-core-compat",[xl]:"fire-analytics",[Ol]:"fire-analytics-compat",[Ml]:"fire-app-check",[kl]:"fire-app-check-compat",[Ll]:"fire-auth",[Fl]:"fire-auth-compat",[Ul]:"fire-rtdb",[Bl]:"fire-data-connect",[jl]:"fire-rtdb-compat",[$l]:"fire-fn",[ql]:"fire-fn-compat",[Hl]:"fire-iid",[Gl]:"fire-iid-compat",[zl]:"fire-fcm",[Kl]:"fire-fcm-compat",[Ql]:"fire-perf",[Wl]:"fire-perf-compat",[Xl]:"fire-rc",[Jl]:"fire-rc-compat",[Yl]:"fire-gcs",[Zl]:"fire-gcs-compat",[tu]:"fire-fst",[nu]:"fire-fst-compat",[eu]:"fire-vertex","fire-js":"fire-js",[ru]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ou=new Map,au=new Map,vi=new Map;function Ai(n,t){try{n.container.addComponent(t)}catch(e){xt.debug(`Component ${t.name} failed to register with FirebaseApp ${n.name}`,e)}}function Mn(n){const t=n.name;if(vi.has(t))return xt.debug(`There were multiple attempts to register component ${t}.`),!1;vi.set(t,n);for(const e of ou.values())Ai(e,n);for(const e of au.values())Ai(e,n);return!0}function lu(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uu={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Kr=new yo("app","Firebase",uu);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cu=su;function je(n,t,e){let s=iu[n]??n;e&&(s+=`-${e}`);const i=s.match(/\s|\//),a=t.match(/\s|\//);if(i||a){const u=[`Unable to register library "${s}" with version "${t}":`];i&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&u.push("and"),a&&u.push(`version name "${t}" contains illegal characters (whitespace or "/")`),xt.warn(u.join(" "));return}Mn(new kn(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hu="firebase-heartbeat-database",fu=1,Ke="firebase-heartbeat-store";let Cr=null;function To(){return Cr||(Cr=ol(hu,fu,{upgrade:(n,t)=>{switch(t){case 0:try{n.createObjectStore(Ke)}catch(e){console.warn(e)}}}}).catch(n=>{throw Kr.create("idb-open",{originalErrorMessage:n.message})})),Cr}async function du(n){try{const e=(await To()).transaction(Ke),s=await e.objectStore(Ke).get(vo(n));return await e.done,s}catch(t){if(t instanceof Ee)xt.warn(t.message);else{const e=Kr.create("idb-get",{originalErrorMessage:t?.message});xt.warn(e.message)}}}async function Ii(n,t){try{const s=(await To()).transaction(Ke,"readwrite");await s.objectStore(Ke).put(t,vo(n)),await s.done}catch(e){if(e instanceof Ee)xt.warn(e.message);else{const s=Kr.create("idb-set",{originalErrorMessage:e?.message});xt.warn(s.message)}}}function vo(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pu=1024,mu=30;class gu{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new yu(e),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{const e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=wi();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(i=>i.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:e}),this._heartbeatsCache.heartbeats.length>mu){const i=Eu(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){xt.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=wi(),{heartbeatsToSend:e,unsentEntries:s}=_u(this._heartbeatsCache.heartbeats),i=_o(JSON.stringify({version:2,heartbeats:e}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return xt.warn(t),""}}}function wi(){return new Date().toISOString().substring(0,10)}function _u(n,t=pu){const e=[];let s=n.slice();for(const i of n){const a=e.find(u=>u.agent===i.agent);if(a){if(a.dates.push(i.date),Ri(e)>t){a.dates.pop();break}}else if(e.push({agent:i.agent,dates:[i.date]}),Ri(e)>t){e.pop();break}s=s.slice(1)}return{heartbeatsToSend:e,unsentEntries:s}}class yu{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Tl()?vl().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await du(this.app);return e?.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const s=await this.read();return Ii(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){const s=await this.read();return Ii(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}}function Ri(n){return _o(JSON.stringify({version:2,heartbeats:n})).length}function Eu(n){if(n.length===0)return-1;let t=0,e=n[0].date;for(let s=1;s<n.length;s++)n[s].date<e&&(e=n[s].date,t=s);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tu(n){Mn(new kn("platform-logger",t=>new bl(t),"PRIVATE")),Mn(new kn("heartbeat",t=>new gu(t),"PRIVATE")),je(xr,Ti,n),je(xr,Ti,"esm2020"),je("fire-js","")}Tu("");var Si=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Qr;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(y,f){function m(){}m.prototype=f.prototype,y.F=f.prototype,y.prototype=new m,y.prototype.constructor=y,y.D=function(E,_,v){for(var d=Array(arguments.length-2),mt=2;mt<arguments.length;mt++)d[mt-2]=arguments[mt];return f.prototype[_].apply(E,d)}}function e(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(s,e),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(y,f,m){m||(m=0);const E=Array(16);if(typeof f=="string")for(var _=0;_<16;++_)E[_]=f.charCodeAt(m++)|f.charCodeAt(m++)<<8|f.charCodeAt(m++)<<16|f.charCodeAt(m++)<<24;else for(_=0;_<16;++_)E[_]=f[m++]|f[m++]<<8|f[m++]<<16|f[m++]<<24;f=y.g[0],m=y.g[1],_=y.g[2];let v=y.g[3],d;d=f+(v^m&(_^v))+E[0]+3614090360&4294967295,f=m+(d<<7&4294967295|d>>>25),d=v+(_^f&(m^_))+E[1]+3905402710&4294967295,v=f+(d<<12&4294967295|d>>>20),d=_+(m^v&(f^m))+E[2]+606105819&4294967295,_=v+(d<<17&4294967295|d>>>15),d=m+(f^_&(v^f))+E[3]+3250441966&4294967295,m=_+(d<<22&4294967295|d>>>10),d=f+(v^m&(_^v))+E[4]+4118548399&4294967295,f=m+(d<<7&4294967295|d>>>25),d=v+(_^f&(m^_))+E[5]+1200080426&4294967295,v=f+(d<<12&4294967295|d>>>20),d=_+(m^v&(f^m))+E[6]+2821735955&4294967295,_=v+(d<<17&4294967295|d>>>15),d=m+(f^_&(v^f))+E[7]+4249261313&4294967295,m=_+(d<<22&4294967295|d>>>10),d=f+(v^m&(_^v))+E[8]+1770035416&4294967295,f=m+(d<<7&4294967295|d>>>25),d=v+(_^f&(m^_))+E[9]+2336552879&4294967295,v=f+(d<<12&4294967295|d>>>20),d=_+(m^v&(f^m))+E[10]+4294925233&4294967295,_=v+(d<<17&4294967295|d>>>15),d=m+(f^_&(v^f))+E[11]+2304563134&4294967295,m=_+(d<<22&4294967295|d>>>10),d=f+(v^m&(_^v))+E[12]+1804603682&4294967295,f=m+(d<<7&4294967295|d>>>25),d=v+(_^f&(m^_))+E[13]+4254626195&4294967295,v=f+(d<<12&4294967295|d>>>20),d=_+(m^v&(f^m))+E[14]+2792965006&4294967295,_=v+(d<<17&4294967295|d>>>15),d=m+(f^_&(v^f))+E[15]+1236535329&4294967295,m=_+(d<<22&4294967295|d>>>10),d=f+(_^v&(m^_))+E[1]+4129170786&4294967295,f=m+(d<<5&4294967295|d>>>27),d=v+(m^_&(f^m))+E[6]+3225465664&4294967295,v=f+(d<<9&4294967295|d>>>23),d=_+(f^m&(v^f))+E[11]+643717713&4294967295,_=v+(d<<14&4294967295|d>>>18),d=m+(v^f&(_^v))+E[0]+3921069994&4294967295,m=_+(d<<20&4294967295|d>>>12),d=f+(_^v&(m^_))+E[5]+3593408605&4294967295,f=m+(d<<5&4294967295|d>>>27),d=v+(m^_&(f^m))+E[10]+38016083&4294967295,v=f+(d<<9&4294967295|d>>>23),d=_+(f^m&(v^f))+E[15]+3634488961&4294967295,_=v+(d<<14&4294967295|d>>>18),d=m+(v^f&(_^v))+E[4]+3889429448&4294967295,m=_+(d<<20&4294967295|d>>>12),d=f+(_^v&(m^_))+E[9]+568446438&4294967295,f=m+(d<<5&4294967295|d>>>27),d=v+(m^_&(f^m))+E[14]+3275163606&4294967295,v=f+(d<<9&4294967295|d>>>23),d=_+(f^m&(v^f))+E[3]+4107603335&4294967295,_=v+(d<<14&4294967295|d>>>18),d=m+(v^f&(_^v))+E[8]+1163531501&4294967295,m=_+(d<<20&4294967295|d>>>12),d=f+(_^v&(m^_))+E[13]+2850285829&4294967295,f=m+(d<<5&4294967295|d>>>27),d=v+(m^_&(f^m))+E[2]+4243563512&4294967295,v=f+(d<<9&4294967295|d>>>23),d=_+(f^m&(v^f))+E[7]+1735328473&4294967295,_=v+(d<<14&4294967295|d>>>18),d=m+(v^f&(_^v))+E[12]+2368359562&4294967295,m=_+(d<<20&4294967295|d>>>12),d=f+(m^_^v)+E[5]+4294588738&4294967295,f=m+(d<<4&4294967295|d>>>28),d=v+(f^m^_)+E[8]+2272392833&4294967295,v=f+(d<<11&4294967295|d>>>21),d=_+(v^f^m)+E[11]+1839030562&4294967295,_=v+(d<<16&4294967295|d>>>16),d=m+(_^v^f)+E[14]+4259657740&4294967295,m=_+(d<<23&4294967295|d>>>9),d=f+(m^_^v)+E[1]+2763975236&4294967295,f=m+(d<<4&4294967295|d>>>28),d=v+(f^m^_)+E[4]+1272893353&4294967295,v=f+(d<<11&4294967295|d>>>21),d=_+(v^f^m)+E[7]+4139469664&4294967295,_=v+(d<<16&4294967295|d>>>16),d=m+(_^v^f)+E[10]+3200236656&4294967295,m=_+(d<<23&4294967295|d>>>9),d=f+(m^_^v)+E[13]+681279174&4294967295,f=m+(d<<4&4294967295|d>>>28),d=v+(f^m^_)+E[0]+3936430074&4294967295,v=f+(d<<11&4294967295|d>>>21),d=_+(v^f^m)+E[3]+3572445317&4294967295,_=v+(d<<16&4294967295|d>>>16),d=m+(_^v^f)+E[6]+76029189&4294967295,m=_+(d<<23&4294967295|d>>>9),d=f+(m^_^v)+E[9]+3654602809&4294967295,f=m+(d<<4&4294967295|d>>>28),d=v+(f^m^_)+E[12]+3873151461&4294967295,v=f+(d<<11&4294967295|d>>>21),d=_+(v^f^m)+E[15]+530742520&4294967295,_=v+(d<<16&4294967295|d>>>16),d=m+(_^v^f)+E[2]+3299628645&4294967295,m=_+(d<<23&4294967295|d>>>9),d=f+(_^(m|~v))+E[0]+4096336452&4294967295,f=m+(d<<6&4294967295|d>>>26),d=v+(m^(f|~_))+E[7]+1126891415&4294967295,v=f+(d<<10&4294967295|d>>>22),d=_+(f^(v|~m))+E[14]+2878612391&4294967295,_=v+(d<<15&4294967295|d>>>17),d=m+(v^(_|~f))+E[5]+4237533241&4294967295,m=_+(d<<21&4294967295|d>>>11),d=f+(_^(m|~v))+E[12]+1700485571&4294967295,f=m+(d<<6&4294967295|d>>>26),d=v+(m^(f|~_))+E[3]+2399980690&4294967295,v=f+(d<<10&4294967295|d>>>22),d=_+(f^(v|~m))+E[10]+4293915773&4294967295,_=v+(d<<15&4294967295|d>>>17),d=m+(v^(_|~f))+E[1]+2240044497&4294967295,m=_+(d<<21&4294967295|d>>>11),d=f+(_^(m|~v))+E[8]+1873313359&4294967295,f=m+(d<<6&4294967295|d>>>26),d=v+(m^(f|~_))+E[15]+4264355552&4294967295,v=f+(d<<10&4294967295|d>>>22),d=_+(f^(v|~m))+E[6]+2734768916&4294967295,_=v+(d<<15&4294967295|d>>>17),d=m+(v^(_|~f))+E[13]+1309151649&4294967295,m=_+(d<<21&4294967295|d>>>11),d=f+(_^(m|~v))+E[4]+4149444226&4294967295,f=m+(d<<6&4294967295|d>>>26),d=v+(m^(f|~_))+E[11]+3174756917&4294967295,v=f+(d<<10&4294967295|d>>>22),d=_+(f^(v|~m))+E[2]+718787259&4294967295,_=v+(d<<15&4294967295|d>>>17),d=m+(v^(_|~f))+E[9]+3951481745&4294967295,y.g[0]=y.g[0]+f&4294967295,y.g[1]=y.g[1]+(_+(d<<21&4294967295|d>>>11))&4294967295,y.g[2]=y.g[2]+_&4294967295,y.g[3]=y.g[3]+v&4294967295}s.prototype.v=function(y,f){f===void 0&&(f=y.length);const m=f-this.blockSize,E=this.C;let _=this.h,v=0;for(;v<f;){if(_==0)for(;v<=m;)i(this,y,v),v+=this.blockSize;if(typeof y=="string"){for(;v<f;)if(E[_++]=y.charCodeAt(v++),_==this.blockSize){i(this,E),_=0;break}}else for(;v<f;)if(E[_++]=y[v++],_==this.blockSize){i(this,E),_=0;break}}this.h=_,this.o+=f},s.prototype.A=function(){var y=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);y[0]=128;for(var f=1;f<y.length-8;++f)y[f]=0;f=this.o*8;for(var m=y.length-8;m<y.length;++m)y[m]=f&255,f/=256;for(this.v(y),y=Array(16),f=0,m=0;m<4;++m)for(let E=0;E<32;E+=8)y[f++]=this.g[m]>>>E&255;return y};function a(y,f){var m=h;return Object.prototype.hasOwnProperty.call(m,y)?m[y]:m[y]=f(y)}function u(y,f){this.h=f;const m=[];let E=!0;for(let _=y.length-1;_>=0;_--){const v=y[_]|0;E&&v==f||(m[_]=v,E=!1)}this.g=m}var h={};function p(y){return-128<=y&&y<128?a(y,function(f){return new u([f|0],f<0?-1:0)}):new u([y|0],y<0?-1:0)}function g(y){if(isNaN(y)||!isFinite(y))return w;if(y<0)return M(g(-y));const f=[];let m=1;for(let E=0;y>=m;E++)f[E]=y/m|0,m*=4294967296;return new u(f,0)}function A(y,f){if(y.length==0)throw Error("number format error: empty string");if(f=f||10,f<2||36<f)throw Error("radix out of range: "+f);if(y.charAt(0)=="-")return M(A(y.substring(1),f));if(y.indexOf("-")>=0)throw Error('number format error: interior "-" character');const m=g(Math.pow(f,8));let E=w;for(let v=0;v<y.length;v+=8){var _=Math.min(8,y.length-v);const d=parseInt(y.substring(v,v+_),f);_<8?(_=g(Math.pow(f,_)),E=E.j(_).add(g(d))):(E=E.j(m),E=E.add(g(d)))}return E}var w=p(0),V=p(1),b=p(16777216);n=u.prototype,n.m=function(){if(L(this))return-M(this).m();let y=0,f=1;for(let m=0;m<this.g.length;m++){const E=this.i(m);y+=(E>=0?E:4294967296+E)*f,f*=4294967296}return y},n.toString=function(y){if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(N(this))return"0";if(L(this))return"-"+M(this).toString(y);const f=g(Math.pow(y,6));var m=this;let E="";for(;;){const _=Tt(m,f).g;m=Q(m,_.j(f));let v=((m.g.length>0?m.g[0]:m.h)>>>0).toString(y);if(m=_,N(m))return v+E;for(;v.length<6;)v="0"+v;E=v+E}},n.i=function(y){return y<0?0:y<this.g.length?this.g[y]:this.h};function N(y){if(y.h!=0)return!1;for(let f=0;f<y.g.length;f++)if(y.g[f]!=0)return!1;return!0}function L(y){return y.h==-1}n.l=function(y){return y=Q(this,y),L(y)?-1:N(y)?0:1};function M(y){const f=y.g.length,m=[];for(let E=0;E<f;E++)m[E]=~y.g[E];return new u(m,~y.h).add(V)}n.abs=function(){return L(this)?M(this):this},n.add=function(y){const f=Math.max(this.g.length,y.g.length),m=[];let E=0;for(let _=0;_<=f;_++){let v=E+(this.i(_)&65535)+(y.i(_)&65535),d=(v>>>16)+(this.i(_)>>>16)+(y.i(_)>>>16);E=d>>>16,v&=65535,d&=65535,m[_]=d<<16|v}return new u(m,m[m.length-1]&-2147483648?-1:0)};function Q(y,f){return y.add(M(f))}n.j=function(y){if(N(this)||N(y))return w;if(L(this))return L(y)?M(this).j(M(y)):M(M(this).j(y));if(L(y))return M(this.j(M(y)));if(this.l(b)<0&&y.l(b)<0)return g(this.m()*y.m());const f=this.g.length+y.g.length,m=[];for(var E=0;E<2*f;E++)m[E]=0;for(E=0;E<this.g.length;E++)for(let _=0;_<y.g.length;_++){const v=this.i(E)>>>16,d=this.i(E)&65535,mt=y.i(_)>>>16,zt=y.i(_)&65535;m[2*E+2*_]+=d*zt,Y(m,2*E+2*_),m[2*E+2*_+1]+=v*zt,Y(m,2*E+2*_+1),m[2*E+2*_+1]+=d*mt,Y(m,2*E+2*_+1),m[2*E+2*_+2]+=v*mt,Y(m,2*E+2*_+2)}for(y=0;y<f;y++)m[y]=m[2*y+1]<<16|m[2*y];for(y=f;y<2*f;y++)m[y]=0;return new u(m,0)};function Y(y,f){for(;(y[f]&65535)!=y[f];)y[f+1]+=y[f]>>>16,y[f]&=65535,f++}function at(y,f){this.g=y,this.h=f}function Tt(y,f){if(N(f))throw Error("division by zero");if(N(y))return new at(w,w);if(L(y))return f=Tt(M(y),f),new at(M(f.g),M(f.h));if(L(f))return f=Tt(y,M(f)),new at(M(f.g),f.h);if(y.g.length>30){if(L(y)||L(f))throw Error("slowDivide_ only works with positive integers.");for(var m=V,E=f;E.l(y)<=0;)m=Dt(m),E=Dt(E);var _=pt(m,1),v=pt(E,1);for(E=pt(E,2),m=pt(m,2);!N(E);){var d=v.add(E);d.l(y)<=0&&(_=_.add(m),v=d),E=pt(E,1),m=pt(m,1)}return f=Q(y,_.j(f)),new at(_,f)}for(_=w;y.l(f)>=0;){for(m=Math.max(1,Math.floor(y.m()/f.m())),E=Math.ceil(Math.log(m)/Math.LN2),E=E<=48?1:Math.pow(2,E-48),v=g(m),d=v.j(f);L(d)||d.l(y)>0;)m-=E,v=g(m),d=v.j(f);N(v)&&(v=V),_=_.add(v),y=Q(y,d)}return new at(_,y)}n.B=function(y){return Tt(this,y).h},n.and=function(y){const f=Math.max(this.g.length,y.g.length),m=[];for(let E=0;E<f;E++)m[E]=this.i(E)&y.i(E);return new u(m,this.h&y.h)},n.or=function(y){const f=Math.max(this.g.length,y.g.length),m=[];for(let E=0;E<f;E++)m[E]=this.i(E)|y.i(E);return new u(m,this.h|y.h)},n.xor=function(y){const f=Math.max(this.g.length,y.g.length),m=[];for(let E=0;E<f;E++)m[E]=this.i(E)^y.i(E);return new u(m,this.h^y.h)};function Dt(y){const f=y.g.length+1,m=[];for(let E=0;E<f;E++)m[E]=y.i(E)<<1|y.i(E-1)>>>31;return new u(m,y.h)}function pt(y,f){const m=f>>5;f%=32;const E=y.g.length-m,_=[];for(let v=0;v<E;v++)_[v]=f>0?y.i(v+m)>>>f|y.i(v+m+1)<<32-f:y.i(v+m);return new u(_,y.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,u.prototype.add=u.prototype.add,u.prototype.multiply=u.prototype.j,u.prototype.modulo=u.prototype.B,u.prototype.compare=u.prototype.l,u.prototype.toNumber=u.prototype.m,u.prototype.toString=u.prototype.toString,u.prototype.getBits=u.prototype.i,u.fromNumber=g,u.fromString=A,Qr=u}).apply(typeof Si<"u"?Si:typeof self<"u"?self:typeof window<"u"?window:{});var In=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ao,Be,Io,Cn,kr,wo,Ro,So;(function(){var n,t=Object.defineProperty;function e(r){r=[typeof globalThis=="object"&&globalThis,r,typeof window=="object"&&window,typeof self=="object"&&self,typeof In=="object"&&In];for(var o=0;o<r.length;++o){var l=r[o];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var s=e(this);function i(r,o){if(o)t:{var l=s;r=r.split(".");for(var c=0;c<r.length-1;c++){var T=r[c];if(!(T in l))break t;l=l[T]}r=r[r.length-1],c=l[r],o=o(c),o!=c&&o!=null&&t(l,r,{configurable:!0,writable:!0,value:o})}}i("Symbol.dispose",function(r){return r||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(r){return r||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(r){return r||function(o){var l=[],c;for(c in o)Object.prototype.hasOwnProperty.call(o,c)&&l.push([c,o[c]]);return l}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function h(r){var o=typeof r;return o=="object"&&r!=null||o=="function"}function p(r,o,l){return r.call.apply(r.bind,arguments)}function g(r,o,l){return g=p,g.apply(null,arguments)}function A(r,o){var l=Array.prototype.slice.call(arguments,1);return function(){var c=l.slice();return c.push.apply(c,arguments),r.apply(this,c)}}function w(r,o){function l(){}l.prototype=o.prototype,r.Z=o.prototype,r.prototype=new l,r.prototype.constructor=r,r.Ob=function(c,T,I){for(var P=Array(arguments.length-2),O=2;O<arguments.length;O++)P[O-2]=arguments[O];return o.prototype[T].apply(c,P)}}var V=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?r=>r&&AsyncContext.Snapshot.wrap(r):r=>r;function b(r){const o=r.length;if(o>0){const l=Array(o);for(let c=0;c<o;c++)l[c]=r[c];return l}return[]}function N(r,o){for(let c=1;c<arguments.length;c++){const T=arguments[c];var l=typeof T;if(l=l!="object"?l:T?Array.isArray(T)?"array":l:"null",l=="array"||l=="object"&&typeof T.length=="number"){l=r.length||0;const I=T.length||0;r.length=l+I;for(let P=0;P<I;P++)r[l+P]=T[P]}else r.push(T)}}class L{constructor(o,l){this.i=o,this.j=l,this.h=0,this.g=null}get(){let o;return this.h>0?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function M(r){u.setTimeout(()=>{throw r},0)}function Q(){var r=y;let o=null;return r.g&&(o=r.g,r.g=r.g.next,r.g||(r.h=null),o.next=null),o}class Y{constructor(){this.h=this.g=null}add(o,l){const c=at.get();c.set(o,l),this.h?this.h.next=c:this.g=c,this.h=c}}var at=new L(()=>new Tt,r=>r.reset());class Tt{constructor(){this.next=this.g=this.h=null}set(o,l){this.h=o,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let Dt,pt=!1,y=new Y,f=()=>{const r=Promise.resolve(void 0);Dt=()=>{r.then(m)}};function m(){for(var r;r=Q();){try{r.h.call(r.g)}catch(l){M(l)}var o=at;o.j(r),o.h<100&&(o.h++,r.next=o.g,o.g=r)}pt=!1}function E(){this.u=this.u,this.C=this.C}E.prototype.u=!1,E.prototype.dispose=function(){this.u||(this.u=!0,this.N())},E.prototype[Symbol.dispose]=function(){this.dispose()},E.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function _(r,o){this.type=r,this.g=this.target=o,this.defaultPrevented=!1}_.prototype.h=function(){this.defaultPrevented=!0};var v=(function(){if(!u.addEventListener||!Object.defineProperty)return!1;var r=!1,o=Object.defineProperty({},"passive",{get:function(){r=!0}});try{const l=()=>{};u.addEventListener("test",l,o),u.removeEventListener("test",l,o)}catch{}return r})();function d(r){return/^[\s\xa0]*$/.test(r)}function mt(r,o){_.call(this,r?r.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,r&&this.init(r,o)}w(mt,_),mt.prototype.init=function(r,o){const l=this.type=r.type,c=r.changedTouches&&r.changedTouches.length?r.changedTouches[0]:null;this.target=r.target||r.srcElement,this.g=o,o=r.relatedTarget,o||(l=="mouseover"?o=r.fromElement:l=="mouseout"&&(o=r.toElement)),this.relatedTarget=o,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=r.clientX!==void 0?r.clientX:r.pageX,this.clientY=r.clientY!==void 0?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0),this.button=r.button,this.key=r.key||"",this.ctrlKey=r.ctrlKey,this.altKey=r.altKey,this.shiftKey=r.shiftKey,this.metaKey=r.metaKey,this.pointerId=r.pointerId||0,this.pointerType=r.pointerType,this.state=r.state,this.i=r,r.defaultPrevented&&mt.Z.h.call(this)},mt.prototype.h=function(){mt.Z.h.call(this);const r=this.i;r.preventDefault?r.preventDefault():r.returnValue=!1};var zt="closure_listenable_"+(Math.random()*1e6|0),Va=0;function Ca(r,o,l,c,T){this.listener=r,this.proxy=null,this.src=o,this.type=l,this.capture=!!c,this.ha=T,this.key=++Va,this.da=this.fa=!1}function ln(r){r.da=!0,r.listener=null,r.proxy=null,r.src=null,r.ha=null}function un(r,o,l){for(const c in r)o.call(l,r[c],c,r)}function ba(r,o){for(const l in r)o.call(void 0,r[l],l,r)}function ys(r){const o={};for(const l in r)o[l]=r[l];return o}const Es="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Ts(r,o){let l,c;for(let T=1;T<arguments.length;T++){c=arguments[T];for(l in c)r[l]=c[l];for(let I=0;I<Es.length;I++)l=Es[I],Object.prototype.hasOwnProperty.call(c,l)&&(r[l]=c[l])}}function cn(r){this.src=r,this.g={},this.h=0}cn.prototype.add=function(r,o,l,c,T){const I=r.toString();r=this.g[I],r||(r=this.g[I]=[],this.h++);const P=or(r,o,c,T);return P>-1?(o=r[P],l||(o.fa=!1)):(o=new Ca(o,this.src,I,!!c,T),o.fa=l,r.push(o)),o};function ir(r,o){const l=o.type;if(l in r.g){var c=r.g[l],T=Array.prototype.indexOf.call(c,o,void 0),I;(I=T>=0)&&Array.prototype.splice.call(c,T,1),I&&(ln(o),r.g[l].length==0&&(delete r.g[l],r.h--))}}function or(r,o,l,c){for(let T=0;T<r.length;++T){const I=r[T];if(!I.da&&I.listener==o&&I.capture==!!l&&I.ha==c)return T}return-1}var ar="closure_lm_"+(Math.random()*1e6|0),lr={};function vs(r,o,l,c,T){if(Array.isArray(o)){for(let I=0;I<o.length;I++)vs(r,o[I],l,c,T);return null}return l=ws(l),r&&r[zt]?r.J(o,l,h(c)?!!c.capture:!1,T):Da(r,o,l,!1,c,T)}function Da(r,o,l,c,T,I){if(!o)throw Error("Invalid event type");const P=h(T)?!!T.capture:!!T;let O=cr(r);if(O||(r[ar]=O=new cn(r)),l=O.add(o,l,c,P,I),l.proxy)return l;if(c=Na(),l.proxy=c,c.src=r,c.listener=l,r.addEventListener)v||(T=P),T===void 0&&(T=!1),r.addEventListener(o.toString(),c,T);else if(r.attachEvent)r.attachEvent(Is(o.toString()),c);else if(r.addListener&&r.removeListener)r.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return l}function Na(){function r(l){return o.call(r.src,r.listener,l)}const o=Oa;return r}function As(r,o,l,c,T){if(Array.isArray(o))for(var I=0;I<o.length;I++)As(r,o[I],l,c,T);else c=h(c)?!!c.capture:!!c,l=ws(l),r&&r[zt]?(r=r.i,I=String(o).toString(),I in r.g&&(o=r.g[I],l=or(o,l,c,T),l>-1&&(ln(o[l]),Array.prototype.splice.call(o,l,1),o.length==0&&(delete r.g[I],r.h--)))):r&&(r=cr(r))&&(o=r.g[o.toString()],r=-1,o&&(r=or(o,l,c,T)),(l=r>-1?o[r]:null)&&ur(l))}function ur(r){if(typeof r!="number"&&r&&!r.da){var o=r.src;if(o&&o[zt])ir(o.i,r);else{var l=r.type,c=r.proxy;o.removeEventListener?o.removeEventListener(l,c,r.capture):o.detachEvent?o.detachEvent(Is(l),c):o.addListener&&o.removeListener&&o.removeListener(c),(l=cr(o))?(ir(l,r),l.h==0&&(l.src=null,o[ar]=null)):ln(r)}}}function Is(r){return r in lr?lr[r]:lr[r]="on"+r}function Oa(r,o){if(r.da)r=!0;else{o=new mt(o,this);const l=r.listener,c=r.ha||r.src;r.fa&&ur(r),r=l.call(c,o)}return r}function cr(r){return r=r[ar],r instanceof cn?r:null}var hr="__closure_events_fn_"+(Math.random()*1e9>>>0);function ws(r){return typeof r=="function"?r:(r[hr]||(r[hr]=function(o){return r.handleEvent(o)}),r[hr])}function lt(){E.call(this),this.i=new cn(this),this.M=this,this.G=null}w(lt,E),lt.prototype[zt]=!0,lt.prototype.removeEventListener=function(r,o,l,c){As(this,r,o,l,c)};function ft(r,o){var l,c=r.G;if(c)for(l=[];c;c=c.G)l.push(c);if(r=r.M,c=o.type||o,typeof o=="string")o=new _(o,r);else if(o instanceof _)o.target=o.target||r;else{var T=o;o=new _(c,r),Ts(o,T)}T=!0;let I,P;if(l)for(P=l.length-1;P>=0;P--)I=o.g=l[P],T=hn(I,c,!0,o)&&T;if(I=o.g=r,T=hn(I,c,!0,o)&&T,T=hn(I,c,!1,o)&&T,l)for(P=0;P<l.length;P++)I=o.g=l[P],T=hn(I,c,!1,o)&&T}lt.prototype.N=function(){if(lt.Z.N.call(this),this.i){var r=this.i;for(const o in r.g){const l=r.g[o];for(let c=0;c<l.length;c++)ln(l[c]);delete r.g[o],r.h--}}this.G=null},lt.prototype.J=function(r,o,l,c){return this.i.add(String(r),o,!1,l,c)},lt.prototype.K=function(r,o,l,c){return this.i.add(String(r),o,!0,l,c)};function hn(r,o,l,c){if(o=r.i.g[String(o)],!o)return!0;o=o.concat();let T=!0;for(let I=0;I<o.length;++I){const P=o[I];if(P&&!P.da&&P.capture==l){const O=P.listener,Z=P.ha||P.src;P.fa&&ir(r.i,P),T=O.call(Z,c)!==!1&&T}}return T&&!c.defaultPrevented}function xa(r,o){if(typeof r!="function")if(r&&typeof r.handleEvent=="function")r=g(r.handleEvent,r);else throw Error("Invalid listener argument");return Number(o)>2147483647?-1:u.setTimeout(r,o||0)}function Rs(r){r.g=xa(()=>{r.g=null,r.i&&(r.i=!1,Rs(r))},r.l);const o=r.h;r.h=null,r.m.apply(null,o)}class ka extends E{constructor(o,l){super(),this.m=o,this.l=l,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:Rs(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ae(r){E.call(this),this.h=r,this.g={}}w(Ae,E);var Ss=[];function Ps(r){un(r.g,function(o,l){this.g.hasOwnProperty(l)&&ur(o)},r),r.g={}}Ae.prototype.N=function(){Ae.Z.N.call(this),Ps(this)},Ae.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var fr=u.JSON.stringify,Ma=u.JSON.parse,La=class{stringify(r){return u.JSON.stringify(r,void 0)}parse(r){return u.JSON.parse(r,void 0)}};function Vs(){}function Cs(){}var Ie={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function dr(){_.call(this,"d")}w(dr,_);function pr(){_.call(this,"c")}w(pr,_);var Kt={},bs=null;function fn(){return bs=bs||new lt}Kt.Ia="serverreachability";function Ds(r){_.call(this,Kt.Ia,r)}w(Ds,_);function we(r){const o=fn();ft(o,new Ds(o))}Kt.STAT_EVENT="statevent";function Ns(r,o){_.call(this,Kt.STAT_EVENT,r),this.stat=o}w(Ns,_);function dt(r){const o=fn();ft(o,new Ns(o,r))}Kt.Ja="timingevent";function Os(r,o){_.call(this,Kt.Ja,r),this.size=o}w(Os,_);function Re(r,o){if(typeof r!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){r()},o)}function Se(){this.g=!0}Se.prototype.ua=function(){this.g=!1};function Fa(r,o,l,c,T,I){r.info(function(){if(r.g)if(I){var P="",O=I.split("&");for(let j=0;j<O.length;j++){var Z=O[j].split("=");if(Z.length>1){const tt=Z[0];Z=Z[1];const St=tt.split("_");P=St.length>=2&&St[1]=="type"?P+(tt+"="+Z+"&"):P+(tt+"=redacted&")}}}else P=null;else P=I;return"XMLHTTP REQ ("+c+") [attempt "+T+"]: "+o+`
`+l+`
`+P})}function Ua(r,o,l,c,T,I,P){r.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+T+"]: "+o+`
`+l+`
`+I+" "+P})}function ae(r,o,l,c){r.info(function(){return"XMLHTTP TEXT ("+o+"): "+ja(r,l)+(c?" "+c:"")})}function Ba(r,o){r.info(function(){return"TIMEOUT: "+o})}Se.prototype.info=function(){};function ja(r,o){if(!r.g)return o;if(!o)return null;try{const I=JSON.parse(o);if(I){for(r=0;r<I.length;r++)if(Array.isArray(I[r])){var l=I[r];if(!(l.length<2)){var c=l[1];if(Array.isArray(c)&&!(c.length<1)){var T=c[0];if(T!="noop"&&T!="stop"&&T!="close")for(let P=1;P<c.length;P++)c[P]=""}}}}return fr(I)}catch{return o}}var dn={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},xs={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},ks;function mr(){}w(mr,Vs),mr.prototype.g=function(){return new XMLHttpRequest},ks=new mr;function Pe(r){return encodeURIComponent(String(r))}function $a(r){var o=1;r=r.split(":");const l=[];for(;o>0&&r.length;)l.push(r.shift()),o--;return r.length&&l.push(r.join(":")),l}function kt(r,o,l,c){this.j=r,this.i=o,this.l=l,this.S=c||1,this.V=new Ae(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Ms}function Ms(){this.i=null,this.g="",this.h=!1}var Ls={},gr={};function _r(r,o,l){r.M=1,r.A=mn(Rt(o)),r.u=l,r.R=!0,Fs(r,null)}function Fs(r,o){r.F=Date.now(),pn(r),r.B=Rt(r.A);var l=r.B,c=r.S;Array.isArray(c)||(c=[String(c)]),Js(l.i,"t",c),r.C=0,l=r.j.L,r.h=new Ms,r.g=mi(r.j,l?o:null,!r.u),r.P>0&&(r.O=new ka(g(r.Y,r,r.g),r.P)),o=r.V,l=r.g,c=r.ba;var T="readystatechange";Array.isArray(T)||(T&&(Ss[0]=T.toString()),T=Ss);for(let I=0;I<T.length;I++){const P=vs(l,T[I],c||o.handleEvent,!1,o.h||o);if(!P)break;o.g[P.key]=P}o=r.J?ys(r.J):{},r.u?(r.v||(r.v="POST"),o["Content-Type"]="application/x-www-form-urlencoded",r.g.ea(r.B,r.v,r.u,o)):(r.v="GET",r.g.ea(r.B,r.v,null,o)),we(),Fa(r.i,r.v,r.B,r.l,r.S,r.u)}kt.prototype.ba=function(r){r=r.target;const o=this.O;o&&Ft(r)==3?o.j():this.Y(r)},kt.prototype.Y=function(r){try{if(r==this.g)t:{const O=Ft(this.g),Z=this.g.ya(),j=this.g.ca();if(!(O<3)&&(O!=3||this.g&&(this.h.h||this.g.la()||si(this.g)))){this.K||O!=4||Z==7||(Z==8||j<=0?we(3):we(2)),yr(this);var o=this.g.ca();this.X=o;var l=qa(this);if(this.o=o==200,Ua(this.i,this.v,this.B,this.l,this.S,O,o),this.o){if(this.U&&!this.L){e:{if(this.g){var c,T=this.g;if((c=T.g?T.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!d(c)){var I=c;break e}}I=null}if(r=I)ae(this.i,this.l,r,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Er(this,r);else{this.o=!1,this.m=3,dt(12),Qt(this),Ve(this);break t}}if(this.R){r=!0;let tt;for(;!this.K&&this.C<l.length;)if(tt=Ha(this,l),tt==gr){O==4&&(this.m=4,dt(14),r=!1),ae(this.i,this.l,null,"[Incomplete Response]");break}else if(tt==Ls){this.m=4,dt(15),ae(this.i,this.l,l,"[Invalid Chunk]"),r=!1;break}else ae(this.i,this.l,tt,null),Er(this,tt);if(Us(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),O!=4||l.length!=0||this.h.h||(this.m=1,dt(16),r=!1),this.o=this.o&&r,!r)ae(this.i,this.l,l,"[Invalid Chunked Response]"),Qt(this),Ve(this);else if(l.length>0&&!this.W){this.W=!0;var P=this.j;P.g==this&&P.aa&&!P.P&&(P.j.info("Great, no buffering proxy detected. Bytes received: "+l.length),Pr(P),P.P=!0,dt(11))}}else ae(this.i,this.l,l,null),Er(this,l);O==4&&Qt(this),this.o&&!this.K&&(O==4?hi(this.j,this):(this.o=!1,pn(this)))}else sl(this.g),o==400&&l.indexOf("Unknown SID")>0?(this.m=3,dt(12)):(this.m=0,dt(13)),Qt(this),Ve(this)}}}catch{}finally{}};function qa(r){if(!Us(r))return r.g.la();const o=si(r.g);if(o==="")return"";let l="";const c=o.length,T=Ft(r.g)==4;if(!r.h.i){if(typeof TextDecoder>"u")return Qt(r),Ve(r),"";r.h.i=new u.TextDecoder}for(let I=0;I<c;I++)r.h.h=!0,l+=r.h.i.decode(o[I],{stream:!(T&&I==c-1)});return o.length=0,r.h.g+=l,r.C=0,r.h.g}function Us(r){return r.g?r.v=="GET"&&r.M!=2&&r.j.Aa:!1}function Ha(r,o){var l=r.C,c=o.indexOf(`
`,l);return c==-1?gr:(l=Number(o.substring(l,c)),isNaN(l)?Ls:(c+=1,c+l>o.length?gr:(o=o.slice(c,c+l),r.C=c+l,o)))}kt.prototype.cancel=function(){this.K=!0,Qt(this)};function pn(r){r.T=Date.now()+r.H,Bs(r,r.H)}function Bs(r,o){if(r.D!=null)throw Error("WatchDog timer not null");r.D=Re(g(r.aa,r),o)}function yr(r){r.D&&(u.clearTimeout(r.D),r.D=null)}kt.prototype.aa=function(){this.D=null;const r=Date.now();r-this.T>=0?(Ba(this.i,this.B),this.M!=2&&(we(),dt(17)),Qt(this),this.m=2,Ve(this)):Bs(this,this.T-r)};function Ve(r){r.j.I==0||r.K||hi(r.j,r)}function Qt(r){yr(r);var o=r.O;o&&typeof o.dispose=="function"&&o.dispose(),r.O=null,Ps(r.V),r.g&&(o=r.g,r.g=null,o.abort(),o.dispose())}function Er(r,o){try{var l=r.j;if(l.I!=0&&(l.g==r||Tr(l.h,r))){if(!r.L&&Tr(l.h,r)&&l.I==3){try{var c=l.Ba.g.parse(o)}catch{c=null}if(Array.isArray(c)&&c.length==3){var T=c;if(T[0]==0){t:if(!l.v){if(l.g)if(l.g.F+3e3<r.F)Tn(l),yn(l);else break t;Sr(l),dt(18)}}else l.xa=T[1],0<l.xa-l.K&&T[2]<37500&&l.F&&l.A==0&&!l.C&&(l.C=Re(g(l.Va,l),6e3));qs(l.h)<=1&&l.ta&&(l.ta=void 0)}else Xt(l,11)}else if((r.L||l.g==r)&&Tn(l),!d(o))for(T=l.Ba.g.parse(o),o=0;o<T.length;o++){let j=T[o];const tt=j[0];if(!(tt<=l.K))if(l.K=tt,j=j[1],l.I==2)if(j[0]=="c"){l.M=j[1],l.ba=j[2];const St=j[3];St!=null&&(l.ka=St,l.j.info("VER="+l.ka));const Jt=j[4];Jt!=null&&(l.za=Jt,l.j.info("SVER="+l.za));const Ut=j[5];Ut!=null&&typeof Ut=="number"&&Ut>0&&(c=1.5*Ut,l.O=c,l.j.info("backChannelRequestTimeoutMs_="+c)),c=l;const Bt=r.g;if(Bt){const An=Bt.g?Bt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(An){var I=c.h;I.g||An.indexOf("spdy")==-1&&An.indexOf("quic")==-1&&An.indexOf("h2")==-1||(I.j=I.l,I.g=new Set,I.h&&(vr(I,I.h),I.h=null))}if(c.G){const Vr=Bt.g?Bt.g.getResponseHeader("X-HTTP-Session-Id"):null;Vr&&(c.wa=Vr,q(c.J,c.G,Vr))}}l.I=3,l.l&&l.l.ra(),l.aa&&(l.T=Date.now()-r.F,l.j.info("Handshake RTT: "+l.T+"ms")),c=l;var P=r;if(c.na=pi(c,c.L?c.ba:null,c.W),P.L){Hs(c.h,P);var O=P,Z=c.O;Z&&(O.H=Z),O.D&&(yr(O),pn(O)),c.g=P}else ui(c);l.i.length>0&&En(l)}else j[0]!="stop"&&j[0]!="close"||Xt(l,7);else l.I==3&&(j[0]=="stop"||j[0]=="close"?j[0]=="stop"?Xt(l,7):Rr(l):j[0]!="noop"&&l.l&&l.l.qa(j),l.A=0)}}we(4)}catch{}}var Ga=class{constructor(r,o){this.g=r,this.map=o}};function js(r){this.l=r||10,u.PerformanceNavigationTiming?(r=u.performance.getEntriesByType("navigation"),r=r.length>0&&(r[0].nextHopProtocol=="hq"||r[0].nextHopProtocol=="h2")):r=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=r?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function $s(r){return r.h?!0:r.g?r.g.size>=r.j:!1}function qs(r){return r.h?1:r.g?r.g.size:0}function Tr(r,o){return r.h?r.h==o:r.g?r.g.has(o):!1}function vr(r,o){r.g?r.g.add(o):r.h=o}function Hs(r,o){r.h&&r.h==o?r.h=null:r.g&&r.g.has(o)&&r.g.delete(o)}js.prototype.cancel=function(){if(this.i=Gs(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const r of this.g.values())r.cancel();this.g.clear()}};function Gs(r){if(r.h!=null)return r.i.concat(r.h.G);if(r.g!=null&&r.g.size!==0){let o=r.i;for(const l of r.g.values())o=o.concat(l.G);return o}return b(r.i)}var zs=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function za(r,o){if(r){r=r.split("&");for(let l=0;l<r.length;l++){const c=r[l].indexOf("=");let T,I=null;c>=0?(T=r[l].substring(0,c),I=r[l].substring(c+1)):T=r[l],o(T,I?decodeURIComponent(I.replace(/\+/g," ")):"")}}}function Mt(r){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let o;r instanceof Mt?(this.l=r.l,Ce(this,r.j),this.o=r.o,this.g=r.g,be(this,r.u),this.h=r.h,Ar(this,Ys(r.i)),this.m=r.m):r&&(o=String(r).match(zs))?(this.l=!1,Ce(this,o[1]||"",!0),this.o=De(o[2]||""),this.g=De(o[3]||"",!0),be(this,o[4]),this.h=De(o[5]||"",!0),Ar(this,o[6]||"",!0),this.m=De(o[7]||"")):(this.l=!1,this.i=new Oe(null,this.l))}Mt.prototype.toString=function(){const r=[];var o=this.j;o&&r.push(Ne(o,Ks,!0),":");var l=this.g;return(l||o=="file")&&(r.push("//"),(o=this.o)&&r.push(Ne(o,Ks,!0),"@"),r.push(Pe(l).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.u,l!=null&&r.push(":",String(l))),(l=this.h)&&(this.g&&l.charAt(0)!="/"&&r.push("/"),r.push(Ne(l,l.charAt(0)=="/"?Wa:Qa,!0))),(l=this.i.toString())&&r.push("?",l),(l=this.m)&&r.push("#",Ne(l,Ja)),r.join("")},Mt.prototype.resolve=function(r){const o=Rt(this);let l=!!r.j;l?Ce(o,r.j):l=!!r.o,l?o.o=r.o:l=!!r.g,l?o.g=r.g:l=r.u!=null;var c=r.h;if(l)be(o,r.u);else if(l=!!r.h){if(c.charAt(0)!="/")if(this.g&&!this.h)c="/"+c;else{var T=o.h.lastIndexOf("/");T!=-1&&(c=o.h.slice(0,T+1)+c)}if(T=c,T==".."||T==".")c="";else if(T.indexOf("./")!=-1||T.indexOf("/.")!=-1){c=T.lastIndexOf("/",0)==0,T=T.split("/");const I=[];for(let P=0;P<T.length;){const O=T[P++];O=="."?c&&P==T.length&&I.push(""):O==".."?((I.length>1||I.length==1&&I[0]!="")&&I.pop(),c&&P==T.length&&I.push("")):(I.push(O),c=!0)}c=I.join("/")}else c=T}return l?o.h=c:l=r.i.toString()!=="",l?Ar(o,Ys(r.i)):l=!!r.m,l&&(o.m=r.m),o};function Rt(r){return new Mt(r)}function Ce(r,o,l){r.j=l?De(o,!0):o,r.j&&(r.j=r.j.replace(/:$/,""))}function be(r,o){if(o){if(o=Number(o),isNaN(o)||o<0)throw Error("Bad port number "+o);r.u=o}else r.u=null}function Ar(r,o,l){o instanceof Oe?(r.i=o,Ya(r.i,r.l)):(l||(o=Ne(o,Xa)),r.i=new Oe(o,r.l))}function q(r,o,l){r.i.set(o,l)}function mn(r){return q(r,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),r}function De(r,o){return r?o?decodeURI(r.replace(/%25/g,"%2525")):decodeURIComponent(r):""}function Ne(r,o,l){return typeof r=="string"?(r=encodeURI(r).replace(o,Ka),l&&(r=r.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),r):null}function Ka(r){return r=r.charCodeAt(0),"%"+(r>>4&15).toString(16)+(r&15).toString(16)}var Ks=/[#\/\?@]/g,Qa=/[#\?:]/g,Wa=/[#\?]/g,Xa=/[#\?@]/g,Ja=/#/g;function Oe(r,o){this.h=this.g=null,this.i=r||null,this.j=!!o}function Wt(r){r.g||(r.g=new Map,r.h=0,r.i&&za(r.i,function(o,l){r.add(decodeURIComponent(o.replace(/\+/g," ")),l)}))}n=Oe.prototype,n.add=function(r,o){Wt(this),this.i=null,r=le(this,r);let l=this.g.get(r);return l||this.g.set(r,l=[]),l.push(o),this.h+=1,this};function Qs(r,o){Wt(r),o=le(r,o),r.g.has(o)&&(r.i=null,r.h-=r.g.get(o).length,r.g.delete(o))}function Ws(r,o){return Wt(r),o=le(r,o),r.g.has(o)}n.forEach=function(r,o){Wt(this),this.g.forEach(function(l,c){l.forEach(function(T){r.call(o,T,c,this)},this)},this)};function Xs(r,o){Wt(r);let l=[];if(typeof o=="string")Ws(r,o)&&(l=l.concat(r.g.get(le(r,o))));else for(r=Array.from(r.g.values()),o=0;o<r.length;o++)l=l.concat(r[o]);return l}n.set=function(r,o){return Wt(this),this.i=null,r=le(this,r),Ws(this,r)&&(this.h-=this.g.get(r).length),this.g.set(r,[o]),this.h+=1,this},n.get=function(r,o){return r?(r=Xs(this,r),r.length>0?String(r[0]):o):o};function Js(r,o,l){Qs(r,o),l.length>0&&(r.i=null,r.g.set(le(r,o),b(l)),r.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const r=[],o=Array.from(this.g.keys());for(let c=0;c<o.length;c++){var l=o[c];const T=Pe(l);l=Xs(this,l);for(let I=0;I<l.length;I++){let P=T;l[I]!==""&&(P+="="+Pe(l[I])),r.push(P)}}return this.i=r.join("&")};function Ys(r){const o=new Oe;return o.i=r.i,r.g&&(o.g=new Map(r.g),o.h=r.h),o}function le(r,o){return o=String(o),r.j&&(o=o.toLowerCase()),o}function Ya(r,o){o&&!r.j&&(Wt(r),r.i=null,r.g.forEach(function(l,c){const T=c.toLowerCase();c!=T&&(Qs(this,c),Js(this,T,l))},r)),r.j=o}function Za(r,o){const l=new Se;if(u.Image){const c=new Image;c.onload=A(Lt,l,"TestLoadImage: loaded",!0,o,c),c.onerror=A(Lt,l,"TestLoadImage: error",!1,o,c),c.onabort=A(Lt,l,"TestLoadImage: abort",!1,o,c),c.ontimeout=A(Lt,l,"TestLoadImage: timeout",!1,o,c),u.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=r}else o(!1)}function tl(r,o){const l=new Se,c=new AbortController,T=setTimeout(()=>{c.abort(),Lt(l,"TestPingServer: timeout",!1,o)},1e4);fetch(r,{signal:c.signal}).then(I=>{clearTimeout(T),I.ok?Lt(l,"TestPingServer: ok",!0,o):Lt(l,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(T),Lt(l,"TestPingServer: error",!1,o)})}function Lt(r,o,l,c,T){try{T&&(T.onload=null,T.onerror=null,T.onabort=null,T.ontimeout=null),c(l)}catch{}}function el(){this.g=new La}function Ir(r){this.i=r.Sb||null,this.h=r.ab||!1}w(Ir,Vs),Ir.prototype.g=function(){return new gn(this.i,this.h)};function gn(r,o){lt.call(this),this.H=r,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}w(gn,lt),n=gn.prototype,n.open=function(r,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=r,this.D=o,this.readyState=1,ke(this)},n.send=function(r){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const o={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};r&&(o.body=r),(this.H||u).fetch(new Request(this.D,o)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,xe(this)),this.readyState=0},n.Pa=function(r){if(this.g&&(this.l=r,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=r.headers,this.readyState=2,ke(this)),this.g&&(this.readyState=3,ke(this),this.g)))if(this.responseType==="arraybuffer")r.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in r){if(this.j=r.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Zs(this)}else r.text().then(this.Oa.bind(this),this.ga.bind(this))};function Zs(r){r.j.read().then(r.Ma.bind(r)).catch(r.ga.bind(r))}n.Ma=function(r){if(this.g){if(this.o&&r.value)this.response.push(r.value);else if(!this.o){var o=r.value?r.value:new Uint8Array(0);(o=this.B.decode(o,{stream:!r.done}))&&(this.response=this.responseText+=o)}r.done?xe(this):ke(this),this.readyState==3&&Zs(this)}},n.Oa=function(r){this.g&&(this.response=this.responseText=r,xe(this))},n.Na=function(r){this.g&&(this.response=r,xe(this))},n.ga=function(){this.g&&xe(this)};function xe(r){r.readyState=4,r.l=null,r.j=null,r.B=null,ke(r)}n.setRequestHeader=function(r,o){this.A.append(r,o)},n.getResponseHeader=function(r){return this.h&&this.h.get(r.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const r=[],o=this.h.entries();for(var l=o.next();!l.done;)l=l.value,r.push(l[0]+": "+l[1]),l=o.next();return r.join(`\r
`)};function ke(r){r.onreadystatechange&&r.onreadystatechange.call(r)}Object.defineProperty(gn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(r){this.m=r?"include":"same-origin"}});function ti(r){let o="";return un(r,function(l,c){o+=c,o+=":",o+=l,o+=`\r
`}),o}function wr(r,o,l){t:{for(c in l){var c=!1;break t}c=!0}c||(l=ti(l),typeof r=="string"?l!=null&&Pe(l):q(r,o,l))}function z(r){lt.call(this),this.headers=new Map,this.L=r||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}w(z,lt);var nl=/^https?$/i,rl=["POST","PUT"];n=z.prototype,n.Fa=function(r){this.H=r},n.ea=function(r,o,l,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+r);o=o?o.toUpperCase():"GET",this.D=r,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ks.g(),this.g.onreadystatechange=V(g(this.Ca,this));try{this.B=!0,this.g.open(o,String(r),!0),this.B=!1}catch(I){ei(this,I);return}if(r=l||"",l=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var T in c)l.set(T,c[T]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const I of c.keys())l.set(I,c.get(I));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(l.keys()).find(I=>I.toLowerCase()=="content-type"),T=u.FormData&&r instanceof u.FormData,!(Array.prototype.indexOf.call(rl,o,void 0)>=0)||c||T||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[I,P]of l)this.g.setRequestHeader(I,P);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(r),this.v=!1}catch(I){ei(this,I)}};function ei(r,o){r.h=!1,r.g&&(r.j=!0,r.g.abort(),r.j=!1),r.l=o,r.o=5,ni(r),_n(r)}function ni(r){r.A||(r.A=!0,ft(r,"complete"),ft(r,"error"))}n.abort=function(r){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=r||7,ft(this,"complete"),ft(this,"abort"),_n(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),_n(this,!0)),z.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?ri(this):this.Xa())},n.Xa=function(){ri(this)};function ri(r){if(r.h&&typeof a<"u"){if(r.v&&Ft(r)==4)setTimeout(r.Ca.bind(r),0);else if(ft(r,"readystatechange"),Ft(r)==4){r.h=!1;try{const I=r.ca();t:switch(I){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break t;default:o=!1}var l;if(!(l=o)){var c;if(c=I===0){let P=String(r.D).match(zs)[1]||null;!P&&u.self&&u.self.location&&(P=u.self.location.protocol.slice(0,-1)),c=!nl.test(P?P.toLowerCase():"")}l=c}if(l)ft(r,"complete"),ft(r,"success");else{r.o=6;try{var T=Ft(r)>2?r.g.statusText:""}catch{T=""}r.l=T+" ["+r.ca()+"]",ni(r)}}finally{_n(r)}}}}function _n(r,o){if(r.g){r.m&&(clearTimeout(r.m),r.m=null);const l=r.g;r.g=null,o||ft(r,"ready");try{l.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function Ft(r){return r.g?r.g.readyState:0}n.ca=function(){try{return Ft(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(r){if(this.g){var o=this.g.responseText;return r&&o.indexOf(r)==0&&(o=o.substring(r.length)),Ma(o)}};function si(r){try{if(!r.g)return null;if("response"in r.g)return r.g.response;switch(r.F){case"":case"text":return r.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in r.g)return r.g.mozResponseArrayBuffer}return null}catch{return null}}function sl(r){const o={};r=(r.g&&Ft(r)>=2&&r.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<r.length;c++){if(d(r[c]))continue;var l=$a(r[c]);const T=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const I=o[T]||[];o[T]=I,I.push(l)}ba(o,function(c){return c.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Me(r,o,l){return l&&l.internalChannelParams&&l.internalChannelParams[r]||o}function ii(r){this.za=0,this.i=[],this.j=new Se,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Me("failFast",!1,r),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Me("baseRetryDelayMs",5e3,r),this.Za=Me("retryDelaySeedMs",1e4,r),this.Ta=Me("forwardChannelMaxRetries",2,r),this.va=Me("forwardChannelRequestTimeoutMs",2e4,r),this.ma=r&&r.xmlHttpFactory||void 0,this.Ua=r&&r.Rb||void 0,this.Aa=r&&r.useFetchStreams||!1,this.O=void 0,this.L=r&&r.supportsCrossDomainXhr||!1,this.M="",this.h=new js(r&&r.concurrentRequestLimit),this.Ba=new el,this.S=r&&r.fastHandshake||!1,this.R=r&&r.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=r&&r.Pb||!1,r&&r.ua&&this.j.ua(),r&&r.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&r&&r.detectBufferingProxy||!1,this.ia=void 0,r&&r.longPollingTimeout&&r.longPollingTimeout>0&&(this.ia=r.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=ii.prototype,n.ka=8,n.I=1,n.connect=function(r,o,l,c){dt(0),this.W=r,this.H=o||{},l&&c!==void 0&&(this.H.OSID=l,this.H.OAID=c),this.F=this.X,this.J=pi(this,null,this.W),En(this)};function Rr(r){if(oi(r),r.I==3){var o=r.V++,l=Rt(r.J);if(q(l,"SID",r.M),q(l,"RID",o),q(l,"TYPE","terminate"),Le(r,l),o=new kt(r,r.j,o),o.M=2,o.A=mn(Rt(l)),l=!1,u.navigator&&u.navigator.sendBeacon)try{l=u.navigator.sendBeacon(o.A.toString(),"")}catch{}!l&&u.Image&&(new Image().src=o.A,l=!0),l||(o.g=mi(o.j,null),o.g.ea(o.A)),o.F=Date.now(),pn(o)}di(r)}function yn(r){r.g&&(Pr(r),r.g.cancel(),r.g=null)}function oi(r){yn(r),r.v&&(u.clearTimeout(r.v),r.v=null),Tn(r),r.h.cancel(),r.m&&(typeof r.m=="number"&&u.clearTimeout(r.m),r.m=null)}function En(r){if(!$s(r.h)&&!r.m){r.m=!0;var o=r.Ea;Dt||f(),pt||(Dt(),pt=!0),y.add(o,r),r.D=0}}function il(r,o){return qs(r.h)>=r.h.j-(r.m?1:0)?!1:r.m?(r.i=o.G.concat(r.i),!0):r.I==1||r.I==2||r.D>=(r.Sa?0:r.Ta)?!1:(r.m=Re(g(r.Ea,r,o),fi(r,r.D)),r.D++,!0)}n.Ea=function(r){if(this.m)if(this.m=null,this.I==1){if(!r){this.V=Math.floor(Math.random()*1e5),r=this.V++;const T=new kt(this,this.j,r);let I=this.o;if(this.U&&(I?(I=ys(I),Ts(I,this.U)):I=this.U),this.u!==null||this.R||(T.J=I,I=null),this.S)t:{for(var o=0,l=0;l<this.i.length;l++){e:{var c=this.i[l];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break e}c=void 0}if(c===void 0)break;if(o+=c,o>4096){o=l;break t}if(o===4096||l===this.i.length-1){o=l+1;break t}}o=1e3}else o=1e3;o=li(this,T,o),l=Rt(this.J),q(l,"RID",r),q(l,"CVER",22),this.G&&q(l,"X-HTTP-Session-Id",this.G),Le(this,l),I&&(this.R?o="headers="+Pe(ti(I))+"&"+o:this.u&&wr(l,this.u,I)),vr(this.h,T),this.Ra&&q(l,"TYPE","init"),this.S?(q(l,"$req",o),q(l,"SID","null"),T.U=!0,_r(T,l,null)):_r(T,l,o),this.I=2}}else this.I==3&&(r?ai(this,r):this.i.length==0||$s(this.h)||ai(this))};function ai(r,o){var l;o?l=o.l:l=r.V++;const c=Rt(r.J);q(c,"SID",r.M),q(c,"RID",l),q(c,"AID",r.K),Le(r,c),r.u&&r.o&&wr(c,r.u,r.o),l=new kt(r,r.j,l,r.D+1),r.u===null&&(l.J=r.o),o&&(r.i=o.G.concat(r.i)),o=li(r,l,1e3),l.H=Math.round(r.va*.5)+Math.round(r.va*.5*Math.random()),vr(r.h,l),_r(l,c,o)}function Le(r,o){r.H&&un(r.H,function(l,c){q(o,c,l)}),r.l&&un({},function(l,c){q(o,c,l)})}function li(r,o,l){l=Math.min(r.i.length,l);const c=r.l?g(r.l.Ka,r.l,r):null;t:{var T=r.i;let O=-1;for(;;){const Z=["count="+l];O==-1?l>0?(O=T[0].g,Z.push("ofs="+O)):O=0:Z.push("ofs="+O);let j=!0;for(let tt=0;tt<l;tt++){var I=T[tt].g;const St=T[tt].map;if(I-=O,I<0)O=Math.max(0,T[tt].g-100),j=!1;else try{I="req"+I+"_"||"";try{var P=St instanceof Map?St:Object.entries(St);for(const[Jt,Ut]of P){let Bt=Ut;h(Ut)&&(Bt=fr(Ut)),Z.push(I+Jt+"="+encodeURIComponent(Bt))}}catch(Jt){throw Z.push(I+"type="+encodeURIComponent("_badmap")),Jt}}catch{c&&c(St)}}if(j){P=Z.join("&");break t}}P=void 0}return r=r.i.splice(0,l),o.G=r,P}function ui(r){if(!r.g&&!r.v){r.Y=1;var o=r.Da;Dt||f(),pt||(Dt(),pt=!0),y.add(o,r),r.A=0}}function Sr(r){return r.g||r.v||r.A>=3?!1:(r.Y++,r.v=Re(g(r.Da,r),fi(r,r.A)),r.A++,!0)}n.Da=function(){if(this.v=null,ci(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var r=4*this.T;this.j.info("BP detection timer enabled: "+r),this.B=Re(g(this.Wa,this),r)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,dt(10),yn(this),ci(this))};function Pr(r){r.B!=null&&(u.clearTimeout(r.B),r.B=null)}function ci(r){r.g=new kt(r,r.j,"rpc",r.Y),r.u===null&&(r.g.J=r.o),r.g.P=0;var o=Rt(r.na);q(o,"RID","rpc"),q(o,"SID",r.M),q(o,"AID",r.K),q(o,"CI",r.F?"0":"1"),!r.F&&r.ia&&q(o,"TO",r.ia),q(o,"TYPE","xmlhttp"),Le(r,o),r.u&&r.o&&wr(o,r.u,r.o),r.O&&(r.g.H=r.O);var l=r.g;r=r.ba,l.M=1,l.A=mn(Rt(o)),l.u=null,l.R=!0,Fs(l,r)}n.Va=function(){this.C!=null&&(this.C=null,yn(this),Sr(this),dt(19))};function Tn(r){r.C!=null&&(u.clearTimeout(r.C),r.C=null)}function hi(r,o){var l=null;if(r.g==o){Tn(r),Pr(r),r.g=null;var c=2}else if(Tr(r.h,o))l=o.G,Hs(r.h,o),c=1;else return;if(r.I!=0){if(o.o)if(c==1){l=o.u?o.u.length:0,o=Date.now()-o.F;var T=r.D;c=fn(),ft(c,new Os(c,l)),En(r)}else ui(r);else if(T=o.m,T==3||T==0&&o.X>0||!(c==1&&il(r,o)||c==2&&Sr(r)))switch(l&&l.length>0&&(o=r.h,o.i=o.i.concat(l)),T){case 1:Xt(r,5);break;case 4:Xt(r,10);break;case 3:Xt(r,6);break;default:Xt(r,2)}}}function fi(r,o){let l=r.Qa+Math.floor(Math.random()*r.Za);return r.isActive()||(l*=2),l*o}function Xt(r,o){if(r.j.info("Error code "+o),o==2){var l=g(r.bb,r),c=r.Ua;const T=!c;c=new Mt(c||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||Ce(c,"https"),mn(c),T?Za(c.toString(),l):tl(c.toString(),l)}else dt(2);r.I=0,r.l&&r.l.pa(o),di(r),oi(r)}n.bb=function(r){r?(this.j.info("Successfully pinged google.com"),dt(2)):(this.j.info("Failed to ping google.com"),dt(1))};function di(r){if(r.I=0,r.ja=[],r.l){const o=Gs(r.h);(o.length!=0||r.i.length!=0)&&(N(r.ja,o),N(r.ja,r.i),r.h.i.length=0,b(r.i),r.i.length=0),r.l.oa()}}function pi(r,o,l){var c=l instanceof Mt?Rt(l):new Mt(l);if(c.g!="")o&&(c.g=o+"."+c.g),be(c,c.u);else{var T=u.location;c=T.protocol,o=o?o+"."+T.hostname:T.hostname,T=+T.port;const I=new Mt(null);c&&Ce(I,c),o&&(I.g=o),T&&be(I,T),l&&(I.h=l),c=I}return l=r.G,o=r.wa,l&&o&&q(c,l,o),q(c,"VER",r.ka),Le(r,c),c}function mi(r,o,l){if(o&&!r.L)throw Error("Can't create secondary domain capable XhrIo object.");return o=r.Aa&&!r.ma?new z(new Ir({ab:l})):new z(r.ma),o.Fa(r.L),o}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function gi(){}n=gi.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function vn(){}vn.prototype.g=function(r,o){return new Et(r,o)};function Et(r,o){lt.call(this),this.g=new ii(o),this.l=r,this.h=o&&o.messageUrlParams||null,r=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(r?r["X-Client-Protocol"]="webchannel":r={"X-Client-Protocol":"webchannel"}),this.g.o=r,r=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(r?r["X-WebChannel-Content-Type"]=o.messageContentType:r={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.sa&&(r?r["X-WebChannel-Client-Profile"]=o.sa:r={"X-WebChannel-Client-Profile":o.sa}),this.g.U=r,(r=o&&o.Qb)&&!d(r)&&(this.g.u=r),this.A=o&&o.supportsCrossDomainXhr||!1,this.v=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!d(o)&&(this.g.G=o,r=this.h,r!==null&&o in r&&(r=this.h,o in r&&delete r[o])),this.j=new ue(this)}w(Et,lt),Et.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Et.prototype.close=function(){Rr(this.g)},Et.prototype.o=function(r){var o=this.g;if(typeof r=="string"){var l={};l.__data__=r,r=l}else this.v&&(l={},l.__data__=fr(r),r=l);o.i.push(new Ga(o.Ya++,r)),o.I==3&&En(o)},Et.prototype.N=function(){this.g.l=null,delete this.j,Rr(this.g),delete this.g,Et.Z.N.call(this)};function _i(r){dr.call(this),r.__headers__&&(this.headers=r.__headers__,this.statusCode=r.__status__,delete r.__headers__,delete r.__status__);var o=r.__sm__;if(o){t:{for(const l in o){r=l;break t}r=void 0}(this.i=r)&&(r=this.i,o=o!==null&&r in o?o[r]:void 0),this.data=o}else this.data=r}w(_i,dr);function yi(){pr.call(this),this.status=1}w(yi,pr);function ue(r){this.g=r}w(ue,gi),ue.prototype.ra=function(){ft(this.g,"a")},ue.prototype.qa=function(r){ft(this.g,new _i(r))},ue.prototype.pa=function(r){ft(this.g,new yi)},ue.prototype.oa=function(){ft(this.g,"b")},vn.prototype.createWebChannel=vn.prototype.g,Et.prototype.send=Et.prototype.o,Et.prototype.open=Et.prototype.m,Et.prototype.close=Et.prototype.close,So=function(){return new vn},Ro=function(){return fn()},wo=Kt,kr={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},dn.NO_ERROR=0,dn.TIMEOUT=8,dn.HTTP_ERROR=6,Cn=dn,xs.COMPLETE="complete",Io=xs,Cs.EventType=Ie,Ie.OPEN="a",Ie.CLOSE="b",Ie.ERROR="c",Ie.MESSAGE="d",lt.prototype.listen=lt.prototype.J,Be=Cs,z.prototype.listenOnce=z.prototype.K,z.prototype.getLastError=z.prototype.Ha,z.prototype.getLastErrorCode=z.prototype.ya,z.prototype.getStatus=z.prototype.ca,z.prototype.getResponseJson=z.prototype.La,z.prototype.getResponseText=z.prototype.la,z.prototype.send=z.prototype.ea,z.prototype.setWithCredentials=z.prototype.Fa,Ao=z}).apply(typeof In<"u"?In:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}gt.UNAUTHENTICATED=new gt(null),gt.GOOGLE_CREDENTIALS=new gt("google-credentials-uid"),gt.FIRST_PARTY=new gt("first-party-uid"),gt.MOCK_USER=new gt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Te="12.14.0";function vu(n){Te=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ee=new Eo("@firebase/firestore");function ce(){return ee.logLevel}function C(n,...t){if(ee.logLevel<=U.DEBUG){const e=t.map(Wr);ee.debug(`Firestore (${Te}): ${n}`,...e)}}function ne(n,...t){if(ee.logLevel<=U.ERROR){const e=t.map(Wr);ee.error(`Firestore (${Te}): ${n}`,...e)}}function Ln(n,...t){if(ee.logLevel<=U.WARN){const e=t.map(Wr);ee.warn(`Firestore (${Te}): ${n}`,...e)}}function Wr(n){if(typeof n=="string")return n;try{return(function(e){return JSON.stringify(e)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(n,t,e){let s="Unexpected state";typeof t=="string"?s=t:e=t,Po(n,s,e)}function Po(n,t,e){let s=`FIRESTORE (${Te}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{s+=" CONTEXT: "+JSON.stringify(e)}catch{s+=" CONTEXT: "+e}throw ne(s),new Error(s)}function K(n,t,e,s){let i="Unexpected state";typeof e=="string"?i=e:s=e,n||Po(t,i,s)}function $(n,t){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends Ee{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(){this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Au{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Iu{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable((()=>e(gt.UNAUTHENTICATED)))}shutdown(){}}class wu{constructor(t){this.t=t,this.currentUser=gt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){K(this.o===void 0,42304);let s=this.i;const i=p=>this.i!==s?(s=this.i,e(p)):Promise.resolve();let a=new Zt;this.o=()=>{this.i++,this.currentUser=this.u(),a.resolve(),a=new Zt,t.enqueueRetryable((()=>i(this.currentUser)))};const u=()=>{const p=a;t.enqueueRetryable((async()=>{await p.promise,await i(this.currentUser)}))},h=p=>{C("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=p,this.o&&(this.auth.addAuthTokenListener(this.o),u())};this.t.onInit((p=>h(p))),setTimeout((()=>{if(!this.auth){const p=this.t.getImmediate({optional:!0});p?h(p):(C("FirebaseAuthCredentialsProvider","Auth not yet detected"),a.resolve(),a=new Zt)}}),0),u()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then((s=>this.i!==t?(C("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(K(typeof s.accessToken=="string",31837,{l:s}),new Au(s.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return K(t===null||typeof t=="string",2055,{h:t}),new gt(t)}}class Ru{constructor(t,e,s){this.P=t,this.T=e,this.I=s,this.type="FirstParty",this.user=gt.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const t=this.A();return t&&this.R.set("Authorization",t),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Su{constructor(t,e,s){this.P=t,this.T=e,this.I=s}getToken(){return Promise.resolve(new Ru(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable((()=>e(gt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Pi{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Pu{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,lu(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){K(this.o===void 0,3512);const s=a=>{a.error!=null&&C("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${a.error.message}`);const u=a.token!==this.m;return this.m=a.token,C("FirebaseAppCheckTokenProvider",`Received ${u?"new":"existing"} token.`),u?e(a.token):Promise.resolve()};this.o=a=>{t.enqueueRetryable((()=>s(a)))};const i=a=>{C("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=a,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((a=>i(a))),setTimeout((()=>{if(!this.appCheck){const a=this.V.getImmediate({optional:!0});a?i(a):C("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Pi(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then((e=>e?(K(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new Pi(e.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vu(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let s=0;s<n;s++)e[s]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const i=Vu(40);for(let a=0;a<i.length;++a)s.length<20&&i[a]<e&&(s+=t.charAt(i[a]%62))}return s}}function B(n,t){return n<t?-1:n>t?1:0}function Mr(n,t){const e=Math.min(n.length,t.length);for(let s=0;s<e;s++){const i=n.charAt(s),a=t.charAt(s);if(i!==a)return br(i)===br(a)?B(i,a):br(i)?1:-1}return B(n.length,t.length)}const Cu=55296,bu=57343;function br(n){const t=n.charCodeAt(0);return t>=Cu&&t<=bu}function me(n,t,e){return n.length===t.length&&n.every(((s,i)=>e(s,t[i])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vi="__name__";class Pt{constructor(t,e,s){e===void 0?e=0:e>t.length&&k(637,{offset:e,range:t.length}),s===void 0?s=t.length-e:s>t.length-e&&k(1746,{length:s,range:t.length-e}),this.segments=t,this.offset=e,this.len=s}get length(){return this.len}isEqual(t){return Pt.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Pt?t.forEach((s=>{e.push(s)})):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,s=this.limit();e<s;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const s=Math.min(t.length,e.length);for(let i=0;i<s;i++){const a=Pt.compareSegments(t.get(i),e.get(i));if(a!==0)return a}return B(t.length,e.length)}static compareSegments(t,e){const s=Pt.isNumericId(t),i=Pt.isNumericId(e);return s&&!i?-1:!s&&i?1:s&&i?Pt.extractNumericId(t).compare(Pt.extractNumericId(e)):Mr(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Qr.fromString(t.substring(4,t.length-2))}}class W extends Pt{construct(t,e,s){return new W(t,e,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const s of t){if(s.indexOf("//")>=0)throw new D(S.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);e.push(...s.split("/").filter((i=>i.length>0)))}return new W(e)}static emptyPath(){return new W([])}}const Du=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class it extends Pt{construct(t,e,s){return new it(t,e,s)}static isValidIdentifier(t){return Du.test(t)}canonicalString(){return this.toArray().map((t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),it.isValidIdentifier(t)||(t="`"+t+"`"),t))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Vi}static keyField(){return new it([Vi])}static fromServerFormat(t){const e=[];let s="",i=0;const a=()=>{if(s.length===0)throw new D(S.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(s),s=""};let u=!1;for(;i<t.length;){const h=t[i];if(h==="\\"){if(i+1===t.length)throw new D(S.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const p=t[i+1];if(p!=="\\"&&p!=="."&&p!=="`")throw new D(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);s+=p,i+=2}else h==="`"?(u=!u,i++):h!=="."||u?(s+=h,i++):(a(),i++)}if(a(),u)throw new D(S.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new it(e)}static emptyPath(){return new it([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(t){this.path=t}static fromPath(t){return new x(W.fromString(t))}static fromName(t){return new x(W.fromString(t).popFirst(5))}static empty(){return new x(W.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&W.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return W.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new x(new W(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nu(n,t,e){if(!e)throw new D(S.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function Ou(n,t,e,s){if(t===!0&&s===!0)throw new D(S.INVALID_ARGUMENT,`${n} and ${e} cannot be used together.`)}function Ci(n){if(!x.isDocumentKey(n))throw new D(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Vo(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Jr(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=(function(s){return s.constructor?s.constructor.name:null})(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":k(12329,{type:typeof n})}function bi(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new D(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Jr(n);throw new D(S.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J(n,t){const e={typeString:n};return t&&(e.value=t),e}function en(n,t){if(!Vo(n))throw new D(S.INVALID_ARGUMENT,"JSON must be an object");let e;for(const s in t)if(t[s]){const i=t[s].typeString,a="value"in t[s]?{value:t[s].value}:void 0;if(!(s in n)){e=`JSON missing required field: '${s}'`;break}const u=n[s];if(i&&typeof u!==i){e=`JSON field '${s}' must be a ${i}.`;break}if(a!==void 0&&u!==a.value){e=`Expected '${s}' field to equal '${a.value}'`;break}}if(e)throw new D(S.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Di=-62135596800,Ni=1e6;class G{static now(){return G.fromMillis(Date.now())}static fromDate(t){return G.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),s=Math.floor((t-1e3*e)*Ni);return new G(e,s)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new D(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new D(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<Di)throw new D(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new D(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ni}_compareTo(t){return this.seconds===t.seconds?B(this.nanoseconds,t.nanoseconds):B(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:G._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(en(t,G._jsonSchema))return new G(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Di;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}G._jsonSchemaVersion="firestore/timestamp/1.0",G._jsonSchema={type:J("string",G._jsonSchemaVersion),seconds:J("number"),nanoseconds:J("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{static fromTimestamp(t){return new H(t)}static min(){return new H(new G(0,0))}static max(){return new H(new G(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qe=-1;function xu(n,t){const e=n.toTimestamp().seconds,s=n.toTimestamp().nanoseconds+1,i=H.fromTimestamp(s===1e9?new G(e+1,0):new G(e,s));return new jt(i,x.empty(),t)}function ku(n){return new jt(n.readTime,n.key,Qe)}class jt{constructor(t,e,s){this.readTime=t,this.documentKey=e,this.largestBatchId=s}static min(){return new jt(H.min(),x.empty(),Qe)}static max(){return new jt(H.max(),x.empty(),Qe)}}function Mu(n,t){let e=n.readTime.compareTo(t.readTime);return e!==0?e:(e=x.comparator(n.documentKey,t.documentKey),e!==0?e:B(n.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lu="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Fu{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((t=>t()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yr(n){if(n.code!==S.FAILED_PRECONDITION||n.message!==Lu)throw n;C("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t((e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)}),(e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)}))}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&k(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new R(((s,i)=>{this.nextCallback=a=>{this.wrapSuccess(t,a).next(s,i)},this.catchCallback=a=>{this.wrapFailure(e,a).next(s,i)}}))}toPromise(){return new Promise(((t,e)=>{this.next(t,e)}))}wrapUserFunction(t){try{const e=t();return e instanceof R?e:R.resolve(e)}catch(e){return R.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction((()=>t(e))):R.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction((()=>t(e))):R.reject(e)}static resolve(t){return new R(((e,s)=>{e(t)}))}static reject(t){return new R(((e,s)=>{s(t)}))}static waitFor(t){return new R(((e,s)=>{let i=0,a=0,u=!1;t.forEach((h=>{++i,h.next((()=>{++a,u&&a===i&&e()}),(p=>s(p)))})),u=!0,a===i&&e()}))}static or(t){let e=R.resolve(!1);for(const s of t)e=e.next((i=>i?R.resolve(i):s()));return e}static forEach(t,e){const s=[];return t.forEach(((i,a)=>{s.push(e.call(this,i,a))})),this.waitFor(s)}static mapArray(t,e){return new R(((s,i)=>{const a=t.length,u=new Array(a);let h=0;for(let p=0;p<a;p++){const g=p;e(t[g]).next((A=>{u[g]=A,++h,h===a&&s(u)}),(A=>i(A)))}}))}static doWhile(t,e){return new R(((s,i)=>{const a=()=>{t()===!0?e().next((()=>{a()}),i):s()};a()}))}}function Uu(n){const t=n.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}function nn(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=s=>this.ae(s),this.ue=s=>e.writeSequenceNumber(s))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}Zr.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts=-1;function es(n){return n==null}function Fn(n){return n===0&&1/n==-1/0}function Bu(n){return typeof n=="number"&&Number.isInteger(n)&&!Fn(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Co="";function ju(n){let t="";for(let e=0;e<n.length;e++)t.length>0&&(t=Oi(t)),t=$u(n.get(e),t);return Oi(t)}function $u(n,t){let e=t;const s=n.length;for(let i=0;i<s;i++){const a=n.charAt(i);switch(a){case"\0":e+="";break;case Co:e+="";break;default:e+=a}}return e}function Oi(n){return n+Co+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xi(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function ve(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function bo(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(t,e){this.comparator=t,this.root=e||rt.EMPTY}insert(t,e){return new yt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,rt.BLACK,null,null))}remove(t){return new yt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,rt.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const s=this.comparator(t,e.key);if(s===0)return e.value;s<0?e=e.left:s>0&&(e=e.right)}return null}indexOf(t){let e=0,s=this.root;for(;!s.isEmpty();){const i=this.comparator(t,s.key);if(i===0)return e+s.left.size;i<0?s=s.left:(e+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal(((e,s)=>(t(e,s),!1)))}toString(){const t=[];return this.inorderTraversal(((e,s)=>(t.push(`${e}:${s}`),!1))),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new wn(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new wn(this.root,t,this.comparator,!1)}getReverseIterator(){return new wn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new wn(this.root,t,this.comparator,!0)}}class wn{constructor(t,e,s,i){this.isReverse=i,this.nodeStack=[];let a=1;for(;!t.isEmpty();)if(a=e?s(t.key,e):1,e&&i&&(a*=-1),a<0)t=this.isReverse?t.left:t.right;else{if(a===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class rt{constructor(t,e,s,i,a){this.key=t,this.value=e,this.color=s??rt.RED,this.left=i??rt.EMPTY,this.right=a??rt.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,s,i,a){return new rt(t??this.key,e??this.value,s??this.color,i??this.left,a??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,s){let i=this;const a=s(t,i.key);return i=a<0?i.copy(null,null,null,i.left.insert(t,e,s),null):a===0?i.copy(null,e,null,null,null):i.copy(null,null,null,null,i.right.insert(t,e,s)),i.fixUp()}removeMin(){if(this.left.isEmpty())return rt.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let s,i=this;if(e(t,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(t,e),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),e(t,i.key)===0){if(i.right.isEmpty())return rt.EMPTY;s=i.right.min(),i=i.copy(s.key,s.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(t,e))}return i.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,rt.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,rt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw k(43730,{key:this.key,value:this.value});if(this.right.isRed())throw k(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw k(27949);return t+(this.isRed()?0:1)}}rt.EMPTY=null,rt.RED=!0,rt.BLACK=!1;rt.EMPTY=new class{constructor(){this.size=0}get key(){throw k(57766)}get value(){throw k(16141)}get color(){throw k(16727)}get left(){throw k(29726)}get right(){throw k(36894)}copy(t,e,s,i,a){return this}insert(t,e,s){return new rt(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(t){this.comparator=t,this.data=new yt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal(((e,s)=>(t(e),!1)))}forEachInRange(t,e){const s=this.data.getIteratorFrom(t[0]);for(;s.hasNext();){const i=s.getNext();if(this.comparator(i.key,t[1])>=0)return;e(i.key)}}forEachWhile(t,e){let s;for(s=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();s.hasNext();)if(!t(s.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new ki(this.data.getIterator())}getIteratorFrom(t){return new ki(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach((s=>{e=e.add(s)})),e}isEqual(t){if(!(t instanceof ot)||this.size!==t.size)return!1;const e=this.data.getIterator(),s=t.data.getIterator();for(;e.hasNext();){const i=e.getNext().key,a=s.getNext().key;if(this.comparator(i,a)!==0)return!1}return!0}toArray(){const t=[];return this.forEach((e=>{t.push(e)})),t}toString(){const t=[];return this.forEach((e=>t.push(e))),"SortedSet("+t.toString()+")"}copy(t){const e=new ot(this.comparator);return e.data=t,e}}class ki{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(t){this.fields=t,t.sort(it.comparator)}static empty(){return new wt([])}unionWith(t){let e=new ot(it.comparator);for(const s of this.fields)e=e.add(s);for(const s of t)e=e.add(s);return new wt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return me(this.fields,t.fields,((e,s)=>e.isEqual(s)))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qu extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(t){this.binaryString=t}static fromBase64String(t){const e=(function(i){try{return atob(i)}catch(a){throw typeof DOMException<"u"&&a instanceof DOMException?new qu("Invalid base64 string: "+a):a}})(t);return new Ct(e)}static fromUint8Array(t){const e=(function(i){let a="";for(let u=0;u<i.length;++u)a+=String.fromCharCode(i[u]);return a})(t);return new Ct(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(e){return btoa(e)})(this.binaryString)}toUint8Array(){return(function(e){const s=new Uint8Array(e.length);for(let i=0;i<e.length;i++)s[i]=e.charCodeAt(i);return s})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return B(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Ct.EMPTY_BYTE_STRING=new Ct("");const Hu=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function re(n){if(K(!!n,39018),typeof n=="string"){let t=0;const e=Hu.exec(n);if(K(!!e,46558,{timestamp:n}),e[1]){let i=e[1];i=(i+"000000000").substr(0,9),t=Number(i)}const s=new Date(n);return{seconds:Math.floor(s.getTime()/1e3),nanos:t}}return{seconds:st(n.seconds),nanos:st(n.nanos)}}function st(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function ge(n){return typeof n=="string"?Ct.fromBase64String(n):Ct.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Do="server_timestamp",No="__type__",Oo="__previous_value__",xo="__local_write_time__";function ns(n){return(n?.mapValue?.fields||{})[No]?.stringValue===Do}function rs(n){const t=n.mapValue.fields[Oo];return ns(t)?rs(t):t}function Un(n){const t=re(n.mapValue.fields[xo].timestampValue);return new G(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(t,e,s,i,a,u,h,p,g,A,w){this.databaseId=t,this.appId=e,this.persistenceKey=s,this.host=i,this.ssl=a,this.forceLongPolling=u,this.autoDetectLongPolling=h,this.longPollingOptions=p,this.useFetchStreams=g,this.isUsingEmulator=A,this.apiKey=w}}const Lr="(default)";class Bn{constructor(t,e){this.projectId=t,this.database=e||Lr}static empty(){return new Bn("","")}get isDefaultDatabase(){return this.database===Lr}isEqual(t){return t instanceof Bn&&t.projectId===this.projectId&&t.database===this.database}}function zu(n,t){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new D(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Bn(n.options.projectId,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ko="__type__",Ku="__max__",Rn={mapValue:{}},Mo="__vector__",Fr="value";function se(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ns(n)?4:Wu(n)?9007199254740991:Qu(n)?10:11:k(28295,{value:n})}function bt(n,t){if(n===t)return!0;const e=se(n);if(e!==se(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return Un(n).isEqual(Un(t));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const u=re(i.timestampValue),h=re(a.timestampValue);return u.seconds===h.seconds&&u.nanos===h.nanos})(n,t);case 5:return n.stringValue===t.stringValue;case 6:return(function(i,a){return ge(i.bytesValue).isEqual(ge(a.bytesValue))})(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return(function(i,a){return st(i.geoPointValue.latitude)===st(a.geoPointValue.latitude)&&st(i.geoPointValue.longitude)===st(a.geoPointValue.longitude)})(n,t);case 2:return(function(i,a){if("integerValue"in i&&"integerValue"in a)return st(i.integerValue)===st(a.integerValue);if("doubleValue"in i&&"doubleValue"in a){const u=st(i.doubleValue),h=st(a.doubleValue);return u===h?Fn(u)===Fn(h):isNaN(u)&&isNaN(h)}return!1})(n,t);case 9:return me(n.arrayValue.values||[],t.arrayValue.values||[],bt);case 10:case 11:return(function(i,a){const u=i.mapValue.fields||{},h=a.mapValue.fields||{};if(xi(u)!==xi(h))return!1;for(const p in u)if(u.hasOwnProperty(p)&&(h[p]===void 0||!bt(u[p],h[p])))return!1;return!0})(n,t);default:return k(52216,{left:n})}}function We(n,t){return(n.values||[]).find((e=>bt(e,t)))!==void 0}function _e(n,t){if(n===t)return 0;const e=se(n),s=se(t);if(e!==s)return B(e,s);switch(e){case 0:case 9007199254740991:return 0;case 1:return B(n.booleanValue,t.booleanValue);case 2:return(function(a,u){const h=st(a.integerValue||a.doubleValue),p=st(u.integerValue||u.doubleValue);return h<p?-1:h>p?1:h===p?0:isNaN(h)?isNaN(p)?0:-1:1})(n,t);case 3:return Mi(n.timestampValue,t.timestampValue);case 4:return Mi(Un(n),Un(t));case 5:return Mr(n.stringValue,t.stringValue);case 6:return(function(a,u){const h=ge(a),p=ge(u);return h.compareTo(p)})(n.bytesValue,t.bytesValue);case 7:return(function(a,u){const h=a.split("/"),p=u.split("/");for(let g=0;g<h.length&&g<p.length;g++){const A=B(h[g],p[g]);if(A!==0)return A}return B(h.length,p.length)})(n.referenceValue,t.referenceValue);case 8:return(function(a,u){const h=B(st(a.latitude),st(u.latitude));return h!==0?h:B(st(a.longitude),st(u.longitude))})(n.geoPointValue,t.geoPointValue);case 9:return Li(n.arrayValue,t.arrayValue);case 10:return(function(a,u){const h=a.fields||{},p=u.fields||{},g=h[Fr]?.arrayValue,A=p[Fr]?.arrayValue,w=B(g?.values?.length||0,A?.values?.length||0);return w!==0?w:Li(g,A)})(n.mapValue,t.mapValue);case 11:return(function(a,u){if(a===Rn.mapValue&&u===Rn.mapValue)return 0;if(a===Rn.mapValue)return 1;if(u===Rn.mapValue)return-1;const h=a.fields||{},p=Object.keys(h),g=u.fields||{},A=Object.keys(g);p.sort(),A.sort();for(let w=0;w<p.length&&w<A.length;++w){const V=Mr(p[w],A[w]);if(V!==0)return V;const b=_e(h[p[w]],g[A[w]]);if(b!==0)return b}return B(p.length,A.length)})(n.mapValue,t.mapValue);default:throw k(23264,{he:e})}}function Mi(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return B(n,t);const e=re(n),s=re(t),i=B(e.seconds,s.seconds);return i!==0?i:B(e.nanos,s.nanos)}function Li(n,t){const e=n.values||[],s=t.values||[];for(let i=0;i<e.length&&i<s.length;++i){const a=_e(e[i],s[i]);if(a)return a}return B(e.length,s.length)}function ye(n){return Ur(n)}function Ur(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(e){const s=re(e);return`time(${s.seconds},${s.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(e){return ge(e).toBase64()})(n.bytesValue):"referenceValue"in n?(function(e){return x.fromName(e).toString()})(n.referenceValue):"geoPointValue"in n?(function(e){return`geo(${e.latitude},${e.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(e){let s="[",i=!0;for(const a of e.values||[])i?i=!1:s+=",",s+=Ur(a);return s+"]"})(n.arrayValue):"mapValue"in n?(function(e){const s=Object.keys(e.fields||{}).sort();let i="{",a=!0;for(const u of s)a?a=!1:i+=",",i+=`${u}:${Ur(e.fields[u])}`;return i+"}"})(n.mapValue):k(61005,{value:n})}function bn(n){switch(se(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=rs(n);return t?16+bn(t):16;case 5:return 2*n.stringValue.length;case 6:return ge(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(s){return(s.values||[]).reduce(((i,a)=>i+bn(a)),0)})(n.arrayValue);case 10:case 11:return(function(s){let i=0;return ve(s.fields,((a,u)=>{i+=a.length+bn(u)})),i})(n.mapValue);default:throw k(13486,{value:n})}}function Xe(n){return!!n&&"integerValue"in n}function Lo(n){return Xe(n)||(function(e){return!!e&&"doubleValue"in e})(n)}function ss(n){return!!n&&"arrayValue"in n}function Dn(n){return!!n&&"mapValue"in n}function Qu(n){return(n?.mapValue?.fields||{})[ko]?.stringValue===Mo}function $e(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const t={mapValue:{fields:{}}};return ve(n.mapValue.fields,((e,s)=>t.mapValue.fields[e]=$e(s))),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=$e(n.arrayValue.values[e]);return t}return{...n}}function Wu(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Ku}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(t){this.value=t}static empty(){return new At({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let s=0;s<t.length-1;++s)if(e=(e.mapValue.fields||{})[t.get(s)],!Dn(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=$e(e)}setAll(t){let e=it.emptyPath(),s={},i=[];t.forEach(((u,h)=>{if(!e.isImmediateParentOf(h)){const p=this.getFieldsMap(e);this.applyChanges(p,s,i),s={},i=[],e=h.popLast()}u?s[h.lastSegment()]=$e(u):i.push(h.lastSegment())}));const a=this.getFieldsMap(e);this.applyChanges(a,s,i)}delete(t){const e=this.field(t.popLast());Dn(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return bt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let s=0;s<t.length;++s){let i=e.mapValue.fields[t.get(s)];Dn(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},e.mapValue.fields[t.get(s)]=i),e=i}return e.mapValue.fields}applyChanges(t,e,s){ve(e,((i,a)=>t[i]=a));for(const i of s)delete t[i]}clone(){return new At($e(this.value))}}function Fo(n){const t=[];return ve(n.fields,((e,s)=>{const i=new it([e]);if(Dn(s)){const a=Fo(s.mapValue).fields;if(a.length===0)t.push(i);else for(const u of a)t.push(i.child(u))}else t.push(i)})),new wt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(t,e,s,i,a,u,h){this.key=t,this.documentType=e,this.version=s,this.readTime=i,this.createTime=a,this.data=u,this.documentState=h}static newInvalidDocument(t){return new vt(t,0,H.min(),H.min(),H.min(),At.empty(),0)}static newFoundDocument(t,e,s,i){return new vt(t,1,e,H.min(),s,i,0)}static newNoDocument(t,e){return new vt(t,2,e,H.min(),H.min(),At.empty(),0)}static newUnknownDocument(t,e){return new vt(t,3,e,H.min(),H.min(),At.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(H.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=At.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=At.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=H.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof vt&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new vt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(t,e){this.position=t,this.inclusive=e}}function Fi(n,t,e){let s=0;for(let i=0;i<n.position.length;i++){const a=t[i],u=n.position[i];if(a.field.isKeyField()?s=x.comparator(x.fromName(u.referenceValue),e.key):s=_e(u,e.data.field(a.field)),a.dir==="desc"&&(s*=-1),s!==0)break}return s}function Ui(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!bt(n.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n{constructor(t,e="asc"){this.field=t,this.dir=e}}function Xu(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{}class nt extends Uo{constructor(t,e,s){super(),this.field=t,this.op=e,this.value=s}static create(t,e,s){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,s):new Yu(t,e,s):e==="array-contains"?new ec(t,s):e==="in"?new nc(t,s):e==="not-in"?new rc(t,s):e==="array-contains-any"?new sc(t,s):new nt(t,e,s)}static createKeyFieldInFilter(t,e,s){return e==="in"?new Zu(t,s):new tc(t,s)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(_e(e,this.value)):e!==null&&se(this.value)===se(e)&&this.matchesComparison(_e(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return k(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class $t extends Uo{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new $t(t,e)}matches(t){return Bo(this)?this.filters.find((e=>!e.matches(t)))===void 0:this.filters.find((e=>e.matches(t)))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce(((t,e)=>t.concat(e.getFlattenedFilters())),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Bo(n){return n.op==="and"}function jo(n){return Ju(n)&&Bo(n)}function Ju(n){for(const t of n.filters)if(t instanceof $t)return!1;return!0}function Br(n){if(n instanceof nt)return n.field.canonicalString()+n.op.toString()+ye(n.value);if(jo(n))return n.filters.map((t=>Br(t))).join(",");{const t=n.filters.map((e=>Br(e))).join(",");return`${n.op}(${t})`}}function $o(n,t){return n instanceof nt?(function(s,i){return i instanceof nt&&s.op===i.op&&s.field.isEqual(i.field)&&bt(s.value,i.value)})(n,t):n instanceof $t?(function(s,i){return i instanceof $t&&s.op===i.op&&s.filters.length===i.filters.length?s.filters.reduce(((a,u,h)=>a&&$o(u,i.filters[h])),!0):!1})(n,t):void k(19439)}function qo(n){return n instanceof nt?(function(e){return`${e.field.canonicalString()} ${e.op} ${ye(e.value)}`})(n):n instanceof $t?(function(e){return e.op.toString()+" {"+e.getFilters().map(qo).join(" ,")+"}"})(n):"Filter"}class Yu extends nt{constructor(t,e,s){super(t,e,s),this.key=x.fromName(s.referenceValue)}matches(t){const e=x.comparator(t.key,this.key);return this.matchesComparison(e)}}class Zu extends nt{constructor(t,e){super(t,"in",e),this.keys=Ho("in",e)}matches(t){return this.keys.some((e=>e.isEqual(t.key)))}}class tc extends nt{constructor(t,e){super(t,"not-in",e),this.keys=Ho("not-in",e)}matches(t){return!this.keys.some((e=>e.isEqual(t.key)))}}function Ho(n,t){return(t.arrayValue?.values||[]).map((e=>x.fromName(e.referenceValue)))}class ec extends nt{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return ss(e)&&We(e.arrayValue,this.value)}}class nc extends nt{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&We(this.value.arrayValue,e)}}class rc extends nt{constructor(t,e){super(t,"not-in",e)}matches(t){if(We(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!We(this.value.arrayValue,e)}}class sc extends nt{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!ss(e)||!e.arrayValue.values)&&e.arrayValue.values.some((s=>We(this.value.arrayValue,s)))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(t,e=null,s=[],i=[],a=null,u=null,h=null){this.path=t,this.collectionGroup=e,this.orderBy=s,this.filters=i,this.limit=a,this.startAt=u,this.endAt=h,this.Te=null}}function Bi(n,t=null,e=[],s=[],i=null,a=null,u=null){return new ic(n,t,e,s,i,a,u)}function is(n){const t=$(n);if(t.Te===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map((s=>Br(s))).join(","),e+="|ob:",e+=t.orderBy.map((s=>(function(a){return a.field.canonicalString()+a.dir})(s))).join(","),es(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map((s=>ye(s))).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map((s=>ye(s))).join(",")),t.Te=e}return t.Te}function os(n,t){if(n.limit!==t.limit||n.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<n.orderBy.length;e++)if(!Xu(n.orderBy[e],t.orderBy[e]))return!1;if(n.filters.length!==t.filters.length)return!1;for(let e=0;e<n.filters.length;e++)if(!$o(n.filters[e],t.filters[e]))return!1;return n.collectionGroup===t.collectionGroup&&!!n.path.isEqual(t.path)&&!!Ui(n.startAt,t.startAt)&&Ui(n.endAt,t.endAt)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jn{constructor(t,e=null,s=[],i=[],a=null,u="F",h=null,p=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=s,this.filters=i,this.limit=a,this.limitType=u,this.startAt=h,this.endAt=p,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function oc(n,t,e,s,i,a,u,h){return new Jn(n,t,e,s,i,a,u,h)}function ac(n){return new Jn(n)}function ji(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function lc(n){return x.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function uc(n){return n.collectionGroup!==null}function qe(n){const t=$(n);if(t.Ie===null){t.Ie=[];const e=new Set;for(const a of t.explicitOrderBy)t.Ie.push(a),e.add(a.field.canonicalString());const s=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(u){let h=new ot(it.comparator);return u.filters.forEach((p=>{p.getFlattenedFilters().forEach((g=>{g.isInequality()&&(h=h.add(g.field))}))})),h})(t).forEach((a=>{e.has(a.canonicalString())||a.isKeyField()||t.Ie.push(new $n(a,s))})),e.has(it.keyField().canonicalString())||t.Ie.push(new $n(it.keyField(),s))}return t.Ie}function te(n){const t=$(n);return t.Ee||(t.Ee=cc(t,qe(n))),t.Ee}function cc(n,t){if(n.limitType==="F")return Bi(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map((i=>{const a=i.dir==="desc"?"asc":"desc";return new $n(i.field,a)}));const e=n.endAt?new jn(n.endAt.position,n.endAt.inclusive):null,s=n.startAt?new jn(n.startAt.position,n.startAt.inclusive):null;return Bi(n.path,n.collectionGroup,t,n.filters,n.limit,e,s)}}function jr(n,t,e){return new Jn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),t,e,n.startAt,n.endAt)}function Go(n,t){return os(te(n),te(t))&&n.limitType===t.limitType}function zo(n){return`${is(te(n))}|lt:${n.limitType}`}function Fe(n){return`Query(target=${(function(e){let s=e.path.canonicalString();return e.collectionGroup!==null&&(s+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(s+=`, filters: [${e.filters.map((i=>qo(i))).join(", ")}]`),es(e.limit)||(s+=", limit: "+e.limit),e.orderBy.length>0&&(s+=`, orderBy: [${e.orderBy.map((i=>(function(u){return`${u.field.canonicalString()} (${u.dir})`})(i))).join(", ")}]`),e.startAt&&(s+=", startAt: ",s+=e.startAt.inclusive?"b:":"a:",s+=e.startAt.position.map((i=>ye(i))).join(",")),e.endAt&&(s+=", endAt: ",s+=e.endAt.inclusive?"a:":"b:",s+=e.endAt.position.map((i=>ye(i))).join(",")),`Target(${s})`})(te(n))}; limitType=${n.limitType})`}function as(n,t){return t.isFoundDocument()&&(function(s,i){const a=i.key.path;return s.collectionGroup!==null?i.key.hasCollectionId(s.collectionGroup)&&s.path.isPrefixOf(a):x.isDocumentKey(s.path)?s.path.isEqual(a):s.path.isImmediateParentOf(a)})(n,t)&&(function(s,i){for(const a of qe(s))if(!a.field.isKeyField()&&i.data.field(a.field)===null)return!1;return!0})(n,t)&&(function(s,i){for(const a of s.filters)if(!a.matches(i))return!1;return!0})(n,t)&&(function(s,i){return!(s.startAt&&!(function(u,h,p){const g=Fi(u,h,p);return u.inclusive?g<=0:g<0})(s.startAt,qe(s),i)||s.endAt&&!(function(u,h,p){const g=Fi(u,h,p);return u.inclusive?g>=0:g>0})(s.endAt,qe(s),i))})(n,t)}function hc(n){return(t,e)=>{let s=!1;for(const i of qe(n)){const a=fc(i,t,e);if(a!==0)return a;s=s||i.field.isKeyField()}return 0}}function fc(n,t,e){const s=n.field.isKeyField()?x.comparator(t.key,e.key):(function(a,u,h){const p=u.data.field(a),g=h.data.field(a);return p!==null&&g!==null?_e(p,g):k(42886)})(n.field,t,e);switch(n.dir){case"asc":return s;case"desc":return-1*s;default:return k(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),s=this.inner[e];if(s!==void 0){for(const[i,a]of s)if(this.equalsFn(i,t))return a}}has(t){return this.get(t)!==void 0}set(t,e){const s=this.mapKeyFn(t),i=this.inner[s];if(i===void 0)return this.inner[s]=[[t,e]],void this.innerSize++;for(let a=0;a<i.length;a++)if(this.equalsFn(i[a][0],t))return void(i[a]=[t,e]);i.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),s=this.inner[e];if(s===void 0)return!1;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],t))return s.length===1?delete this.inner[e]:s.splice(i,1),this.innerSize--,!0;return!1}forEach(t){ve(this.inner,((e,s)=>{for(const[i,a]of s)t(i,a)}))}isEmpty(){return bo(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dc=new yt(x.comparator);function qn(){return dc}const Ko=new yt(x.comparator);function Sn(...n){let t=Ko;for(const e of n)t=t.insert(e.key,e);return t}function Qo(n){let t=Ko;return n.forEach(((e,s)=>t=t.insert(e,s.overlayedDocument))),t}function Yt(){return He()}function Wo(){return He()}function He(){return new ie((n=>n.toString()),((n,t)=>n.isEqual(t)))}const pc=new yt(x.comparator),mc=new ot(x.comparator);function ct(...n){let t=mc;for(const e of n)t=t.add(e);return t}const gc=new ot(B);function _c(){return gc}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yn(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Fn(t)?"-0":t}}function ls(n){return{integerValue:""+n}}function yc(n,t){return Bu(t)?ls(t):Yn(n,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn{constructor(){this._=void 0}}function Ec(n,t,e){return n instanceof Hn?(function(i,a){const u={fields:{[No]:{stringValue:Do},[xo]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return a&&ns(a)&&(a=rs(a)),a&&(u.fields[Oo]=a),{mapValue:u}})(e,t):n instanceof Je?Jo(n,t):n instanceof Ye?Yo(n,t):n instanceof Ze?(function(i,a){const u=Xo(i,a),h=Kn(u)+Kn(i.Ae);return Xe(u)&&Xe(i.Ae)?ls(h):Yn(i.serializer,h)})(n,t):n instanceof Gn?(function(i,a){return $i(i,a,Math.min)})(n,t):n instanceof zn?(function(i,a){return $i(i,a,Math.max)})(n,t):void 0}function Tc(n,t,e){return n instanceof Je?Jo(n,t):n instanceof Ye?Yo(n,t):e}function Xo(n,t){return n instanceof Ze?Lo(t)?t:{integerValue:0}:null}class Hn extends Zn{}class Je extends Zn{constructor(t){super(),this.elements=t}}function Jo(n,t){const e=Zo(t);for(const s of n.elements)e.some((i=>bt(i,s)))||e.push(s);return{arrayValue:{values:e}}}class Ye extends Zn{constructor(t){super(),this.elements=t}}function Yo(n,t){let e=Zo(t);for(const s of n.elements)e=e.filter((i=>!bt(i,s)));return{arrayValue:{values:e}}}class us extends Zn{constructor(t,e){super(),this.serializer=t,this.Ae=e}}class Ze extends us{}class Gn extends us{}class zn extends us{}function $i(n,t,e){if(!Lo(t))return n.Ae;const s=e(Kn(t),Kn(n.Ae));return Xe(t)&&Xe(n.Ae)?ls(s):Yn(n.serializer,s)}function Kn(n){return st(n.integerValue||n.doubleValue)}function Zo(n){return ss(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function vc(n,t){return n.field.isEqual(t.field)&&(function(s,i){return s instanceof Je&&i instanceof Je||s instanceof Ye&&i instanceof Ye?me(s.elements,i.elements,bt):s instanceof Ze&&i instanceof Ze||s instanceof Gn&&i instanceof Gn||s instanceof zn&&i instanceof zn?bt(s.Ae,i.Ae):s instanceof Hn&&i instanceof Hn})(n.transform,t.transform)}class Ac{constructor(t,e){this.version=t,this.transformResults=e}}class Nt{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Nt}static exists(t){return new Nt(void 0,t)}static updateTime(t){return new Nt(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Nn(n,t){return n.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(n.updateTime):n.exists===void 0||n.exists===t.isFoundDocument()}class tr{}function ta(n,t){if(!n.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return n.isNoDocument()?new na(n.key,Nt.none()):new rn(n.key,n.data,Nt.none());{const e=n.data,s=At.empty();let i=new ot(it.comparator);for(let a of t.fields)if(!i.has(a)){let u=e.field(a);u===null&&a.length>1&&(a=a.popLast(),u=e.field(a)),u===null?s.delete(a):s.set(a,u),i=i.add(a)}return new oe(n.key,s,new wt(i.toArray()),Nt.none())}}function Ic(n,t,e){n instanceof rn?(function(i,a,u){const h=i.value.clone(),p=Hi(i.fieldTransforms,a,u.transformResults);h.setAll(p),a.convertToFoundDocument(u.version,h).setHasCommittedMutations()})(n,t,e):n instanceof oe?(function(i,a,u){if(!Nn(i.precondition,a))return void a.convertToUnknownDocument(u.version);const h=Hi(i.fieldTransforms,a,u.transformResults),p=a.data;p.setAll(ea(i)),p.setAll(h),a.convertToFoundDocument(u.version,p).setHasCommittedMutations()})(n,t,e):(function(i,a,u){a.convertToNoDocument(u.version).setHasCommittedMutations()})(0,t,e)}function Ge(n,t,e,s){return n instanceof rn?(function(a,u,h,p){if(!Nn(a.precondition,u))return h;const g=a.value.clone(),A=Gi(a.fieldTransforms,p,u);return g.setAll(A),u.convertToFoundDocument(u.version,g).setHasLocalMutations(),null})(n,t,e,s):n instanceof oe?(function(a,u,h,p){if(!Nn(a.precondition,u))return h;const g=Gi(a.fieldTransforms,p,u),A=u.data;return A.setAll(ea(a)),A.setAll(g),u.convertToFoundDocument(u.version,A).setHasLocalMutations(),h===null?null:h.unionWith(a.fieldMask.fields).unionWith(a.fieldTransforms.map((w=>w.field)))})(n,t,e,s):(function(a,u,h){return Nn(a.precondition,u)?(u.convertToNoDocument(u.version).setHasLocalMutations(),null):h})(n,t,e)}function wc(n,t){let e=null;for(const s of n.fieldTransforms){const i=t.data.field(s.field),a=Xo(s.transform,i||null);a!=null&&(e===null&&(e=At.empty()),e.set(s.field,a))}return e||null}function qi(n,t){return n.type===t.type&&!!n.key.isEqual(t.key)&&!!n.precondition.isEqual(t.precondition)&&!!(function(s,i){return s===void 0&&i===void 0||!(!s||!i)&&me(s,i,((a,u)=>vc(a,u)))})(n.fieldTransforms,t.fieldTransforms)&&(n.type===0?n.value.isEqual(t.value):n.type!==1||n.data.isEqual(t.data)&&n.fieldMask.isEqual(t.fieldMask))}class rn extends tr{constructor(t,e,s,i=[]){super(),this.key=t,this.value=e,this.precondition=s,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class oe extends tr{constructor(t,e,s,i,a=[]){super(),this.key=t,this.data=e,this.fieldMask=s,this.precondition=i,this.fieldTransforms=a,this.type=1}getFieldMask(){return this.fieldMask}}function ea(n){const t=new Map;return n.fieldMask.fields.forEach((e=>{if(!e.isEmpty()){const s=n.data.field(e);t.set(e,s)}})),t}function Hi(n,t,e){const s=new Map;K(n.length===e.length,32656,{Ve:e.length,de:n.length});for(let i=0;i<e.length;i++){const a=n[i],u=a.transform,h=t.data.field(a.field);s.set(a.field,Tc(u,h,e[i]))}return s}function Gi(n,t,e){const s=new Map;for(const i of n){const a=i.transform,u=e.data.field(i.field);s.set(i.field,Ec(a,u,t))}return s}class na extends tr{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Rc extends tr{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sc{constructor(t,e,s,i){this.batchId=t,this.localWriteTime=e,this.baseMutations=s,this.mutations=i}applyToRemoteDocument(t,e){const s=e.mutationResults;for(let i=0;i<this.mutations.length;i++){const a=this.mutations[i];a.key.isEqual(t.key)&&Ic(a,t,s[i])}}applyToLocalView(t,e){for(const s of this.baseMutations)s.key.isEqual(t.key)&&(e=Ge(s,t,e,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(t.key)&&(e=Ge(s,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const s=Wo();return this.mutations.forEach((i=>{const a=t.get(i.key),u=a.overlayedDocument;let h=this.applyToLocalView(u,a.mutatedFields);h=e.has(i.key)?null:h;const p=ta(u,h);p!==null&&s.set(i.key,p),u.isValidDocument()||u.convertToNoDocument(H.min())})),s}keys(){return this.mutations.reduce(((t,e)=>t.add(e.key)),ct())}isEqual(t){return this.batchId===t.batchId&&me(this.mutations,t.mutations,((e,s)=>qi(e,s)))&&me(this.baseMutations,t.baseMutations,((e,s)=>qi(e,s)))}}class cs{constructor(t,e,s,i){this.batch=t,this.commitVersion=e,this.mutationResults=s,this.docVersions=i}static from(t,e,s){K(t.mutations.length===s.length,58842,{me:t.mutations.length,fe:s.length});let i=(function(){return pc})();const a=t.mutations;for(let u=0;u<a.length;u++)i=i.insert(a[u].key,s[u].version);return new cs(t,e,s,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pc{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X,F;function Vc(n){switch(n){case S.OK:return k(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return k(15467,{code:n})}}function Cc(n){if(n===void 0)return ne("GRPC error has no .code"),S.UNKNOWN;switch(n){case X.OK:return S.OK;case X.CANCELLED:return S.CANCELLED;case X.UNKNOWN:return S.UNKNOWN;case X.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case X.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case X.INTERNAL:return S.INTERNAL;case X.UNAVAILABLE:return S.UNAVAILABLE;case X.UNAUTHENTICATED:return S.UNAUTHENTICATED;case X.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case X.NOT_FOUND:return S.NOT_FOUND;case X.ALREADY_EXISTS:return S.ALREADY_EXISTS;case X.PERMISSION_DENIED:return S.PERMISSION_DENIED;case X.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case X.ABORTED:return S.ABORTED;case X.OUT_OF_RANGE:return S.OUT_OF_RANGE;case X.UNIMPLEMENTED:return S.UNIMPLEMENTED;case X.DATA_LOSS:return S.DATA_LOSS;default:return k(39323,{code:n})}}(F=X||(X={}))[F.OK=0]="OK",F[F.CANCELLED=1]="CANCELLED",F[F.UNKNOWN=2]="UNKNOWN",F[F.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",F[F.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",F[F.NOT_FOUND=5]="NOT_FOUND",F[F.ALREADY_EXISTS=6]="ALREADY_EXISTS",F[F.PERMISSION_DENIED=7]="PERMISSION_DENIED",F[F.UNAUTHENTICATED=16]="UNAUTHENTICATED",F[F.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",F[F.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",F[F.ABORTED=10]="ABORTED",F[F.OUT_OF_RANGE=11]="OUT_OF_RANGE",F[F.UNIMPLEMENTED=12]="UNIMPLEMENTED",F[F.INTERNAL=13]="INTERNAL",F[F.UNAVAILABLE=14]="UNAVAILABLE",F[F.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Qr([4294967295,4294967295],0);class bc{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function $r(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Dc(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function Nc(n,t){return $r(n,t.toTimestamp())}function fe(n){return K(!!n,49232),H.fromTimestamp((function(e){const s=re(e);return new G(s.seconds,s.nanos)})(n))}function ra(n,t){return qr(n,t).canonicalString()}function qr(n,t){const e=(function(i){return new W(["projects",i.projectId,"databases",i.database])})(n).child("documents");return t===void 0?e:e.child(t)}function Oc(n){const t=W.fromString(n);return K(jc(t),10190,{key:t.toString()}),t}function Hr(n,t){return ra(n.databaseId,t.path)}function xc(n){const t=Oc(n);return t.length===4?W.emptyPath():Mc(t)}function kc(n){return new W(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Mc(n){return K(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function zi(n,t,e){return{name:Hr(n,t),fields:e.value.mapValue.fields}}function Lc(n,t){let e;if(t instanceof rn)e={update:zi(n,t.key,t.value)};else if(t instanceof na)e={delete:Hr(n,t.key)};else if(t instanceof oe)e={update:zi(n,t.key,t.data),updateMask:Bc(t.fieldMask)};else{if(!(t instanceof Rc))return k(16599,{Vt:t.type});e={verify:Hr(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map((s=>(function(a,u){const h=u.transform;if(h instanceof Hn)return{fieldPath:u.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(h instanceof Je)return{fieldPath:u.field.canonicalString(),appendMissingElements:{values:h.elements}};if(h instanceof Ye)return{fieldPath:u.field.canonicalString(),removeAllFromArray:{values:h.elements}};if(h instanceof Ze)return{fieldPath:u.field.canonicalString(),increment:h.Ae};if(h instanceof Gn)return{fieldPath:u.field.canonicalString(),minimum:h.Ae};if(h instanceof zn)return{fieldPath:u.field.canonicalString(),maximum:h.Ae};throw k(20930,{transform:u.transform})})(0,s)))),t.precondition.isNone||(e.currentDocument=(function(i,a){return a.updateTime!==void 0?{updateTime:Nc(i,a.updateTime)}:a.exists!==void 0?{exists:a.exists}:k(27497)})(n,t.precondition)),e}function Fc(n,t){return n&&n.length>0?(K(t!==void 0,14353),n.map((e=>(function(i,a){let u=i.updateTime?fe(i.updateTime):fe(a);return u.isEqual(H.min())&&(u=fe(a)),new Ac(u,i.transformResults||[])})(e,t)))):[]}function Uc(n){let t=xc(n.parent);const e=n.structuredQuery,s=e.from?e.from.length:0;let i=null;if(s>0){K(s===1,65062);const A=e.from[0];A.allDescendants?i=A.collectionId:t=t.child(A.collectionId)}let a=[];e.where&&(a=(function(w){const V=sa(w);return V instanceof $t&&jo(V)?V.getFilters():[V]})(e.where));let u=[];e.orderBy&&(u=(function(w){return w.map((V=>(function(N){return new $n(he(N.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(N.direction))})(V)))})(e.orderBy));let h=null;e.limit&&(h=(function(w){let V;return V=typeof w=="object"?w.value:w,es(V)?null:V})(e.limit));let p=null;e.startAt&&(p=(function(w){const V=!!w.before,b=w.values||[];return new jn(b,V)})(e.startAt));let g=null;return e.endAt&&(g=(function(w){const V=!w.before,b=w.values||[];return new jn(b,V)})(e.endAt)),oc(t,i,u,a,h,"F",p,g)}function sa(n){return n.unaryFilter!==void 0?(function(e){switch(e.unaryFilter.op){case"IS_NAN":const s=he(e.unaryFilter.field);return nt.create(s,"==",{doubleValue:NaN});case"IS_NULL":const i=he(e.unaryFilter.field);return nt.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const a=he(e.unaryFilter.field);return nt.create(a,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const u=he(e.unaryFilter.field);return nt.create(u,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return k(61313);default:return k(60726)}})(n):n.fieldFilter!==void 0?(function(e){return nt.create(he(e.fieldFilter.field),(function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return k(58110);default:return k(50506)}})(e.fieldFilter.op),e.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(e){return $t.create(e.compositeFilter.filters.map((s=>sa(s))),(function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return k(1026)}})(e.compositeFilter.op))})(n):k(30097,{filter:n})}function he(n){return it.fromServerFormat(n.fieldPath)}function Bc(n){const t=[];return n.fields.forEach((e=>t.push(e.canonicalString()))),{fieldPaths:t}}function jc(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function ia(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $c{constructor(t){this.gt=t}}function qc(n){const t=Uc({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?jr(t,t.limit,"L"):t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hc{constructor(){this.Sn=new Gc}addToCollectionParentIndex(t,e){return this.Sn.add(e),R.resolve()}getCollectionParents(t,e){return R.resolve(this.Sn.getEntries(e))}addFieldIndex(t,e){return R.resolve()}deleteFieldIndex(t,e){return R.resolve()}deleteAllFieldIndexes(t){return R.resolve()}createTargetIndexes(t,e){return R.resolve()}getDocumentsMatchingTarget(t,e){return R.resolve(null)}getIndexType(t,e){return R.resolve(0)}getFieldIndexes(t,e){return R.resolve([])}getNextCollectionGroupToUpdate(t){return R.resolve(null)}getMinOffset(t,e){return R.resolve(jt.min())}getMinOffsetFromCollectionGroup(t,e){return R.resolve(jt.min())}updateCollectionGroup(t,e,s){return R.resolve()}updateIndexEntries(t,e){return R.resolve()}}class Gc{constructor(){this.index={}}add(t){const e=t.lastSegment(),s=t.popLast(),i=this.index[e]||new ot(W.comparator),a=!i.has(s);return this.index[e]=i.add(s),a}has(t){const e=t.lastSegment(),s=t.popLast(),i=this.index[e];return i&&i.has(s)}getEntries(t){return(this.index[t]||new ot(W.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ki={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},oa=41943040;class _t{static withCacheSize(t){return new _t(t,_t.DEFAULT_COLLECTION_PERCENTILE,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,s){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */_t.DEFAULT_COLLECTION_PERCENTILE=10,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,_t.DEFAULT=new _t(oa,_t.DEFAULT_COLLECTION_PERCENTILE,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),_t.DISABLED=new _t(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(t){this.ir=t}next(){return this.ir+=2,this.ir}static sr(){return new qt(0)}static _r(){return new qt(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qi="LruGarbageCollector",zc=1048576;function Wi([n,t],[e,s]){const i=B(n,e);return i===0?B(t,s):i}class Kc{constructor(t){this.hr=t,this.buffer=new ot(Wi),this.Pr=0}Tr(){return++this.Pr}Ir(t){const e=[t,this.Tr()];if(this.buffer.size<this.hr)this.buffer=this.buffer.add(e);else{const s=this.buffer.last();Wi(e,s)<0&&(this.buffer=this.buffer.delete(s).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Qc{constructor(t,e,s){this.garbageCollector=t,this.asyncQueue=e,this.localStore=s,this.Er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Er&&(this.Er.cancel(),this.Er=null)}get started(){return this.Er!==null}Rr(t){C(Qi,`Garbage collection scheduled in ${t}ms`),this.Er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,(async()=>{this.Er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){nn(e)?C(Qi,"Ignoring IndexedDB error during garbage collection: ",e):await Yr(e)}await this.Rr(3e5)}))}}class Wc{constructor(t,e){this.Ar=t,this.params=e}calculateTargetCount(t,e){return this.Ar.Vr(t).next((s=>Math.floor(e/100*s)))}nthSequenceNumber(t,e){if(e===0)return R.resolve(Zr.ce);const s=new Kc(e);return this.Ar.forEachTarget(t,(i=>s.Ir(i.sequenceNumber))).next((()=>this.Ar.dr(t,(i=>s.Ir(i))))).next((()=>s.maxValue))}removeTargets(t,e,s){return this.Ar.removeTargets(t,e,s)}removeOrphanedDocuments(t,e){return this.Ar.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(C("LruGarbageCollector","Garbage collection skipped; disabled"),R.resolve(Ki)):this.getCacheSize(t).next((s=>s<this.params.cacheSizeCollectionThreshold?(C("LruGarbageCollector",`Garbage collection skipped; Cache size ${s} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ki):this.mr(t,e)))}getCacheSize(t){return this.Ar.getCacheSize(t)}mr(t,e){let s,i,a,u,h,p,g;const A=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next((w=>(w>this.params.maximumSequenceNumbersToCollect?(C("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${w}`),i=this.params.maximumSequenceNumbersToCollect):i=w,u=Date.now(),this.nthSequenceNumber(t,i)))).next((w=>(s=w,h=Date.now(),this.removeTargets(t,s,e)))).next((w=>(a=w,p=Date.now(),this.removeOrphanedDocuments(t,s)))).next((w=>(g=Date.now(),ce()<=U.DEBUG&&C("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${u-A}ms
	Determined least recently used ${i} in `+(h-u)+`ms
	Removed ${a} targets in `+(p-h)+`ms
	Removed ${w} documents in `+(g-p)+`ms
Total Duration: ${g-A}ms`),R.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:a,documentsRemoved:w}))))}}function Xc(n,t){return new Wc(n,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{constructor(){this.changes=new ie((t=>t.toString()),((t,e)=>t.isEqual(e))),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,vt.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const s=this.changes.get(e);return s!==void 0?R.resolve(s):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yc{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zc{constructor(t,e,s,i){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=s,this.indexManager=i}getDocument(t,e){let s=null;return this.documentOverlayCache.getOverlay(t,e).next((i=>(s=i,this.remoteDocumentCache.getEntry(t,e)))).next((i=>(s!==null&&Ge(s.mutation,i,wt.empty(),G.now()),i)))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next((s=>this.getLocalViewOfDocuments(t,s,ct()).next((()=>s))))}getLocalViewOfDocuments(t,e,s=ct()){const i=Yt();return this.populateOverlays(t,i,e).next((()=>this.computeViews(t,e,i,s).next((a=>{let u=Sn();return a.forEach(((h,p)=>{u=u.insert(h,p.overlayedDocument)})),u}))))}getOverlayedDocuments(t,e){const s=Yt();return this.populateOverlays(t,s,e).next((()=>this.computeViews(t,e,s,ct())))}populateOverlays(t,e,s){const i=[];return s.forEach((a=>{e.has(a)||i.push(a)})),this.documentOverlayCache.getOverlays(t,i).next((a=>{a.forEach(((u,h)=>{e.set(u,h)}))}))}computeViews(t,e,s,i){let a=qn();const u=He(),h=(function(){return He()})();return e.forEach(((p,g)=>{const A=s.get(g.key);i.has(g.key)&&(A===void 0||A.mutation instanceof oe)?a=a.insert(g.key,g):A!==void 0?(u.set(g.key,A.mutation.getFieldMask()),Ge(A.mutation,g,A.mutation.getFieldMask(),G.now())):u.set(g.key,wt.empty())})),this.recalculateAndSaveOverlays(t,a).next((p=>(p.forEach(((g,A)=>u.set(g,A))),e.forEach(((g,A)=>h.set(g,new Yc(A,u.get(g)??null)))),h)))}recalculateAndSaveOverlays(t,e){const s=He();let i=new yt(((u,h)=>u-h)),a=ct();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next((u=>{for(const h of u)h.keys().forEach((p=>{const g=e.get(p);if(g===null)return;let A=s.get(p)||wt.empty();A=h.applyToLocalView(g,A),s.set(p,A);const w=(i.get(h.batchId)||ct()).add(p);i=i.insert(h.batchId,w)}))})).next((()=>{const u=[],h=i.getReverseIterator();for(;h.hasNext();){const p=h.getNext(),g=p.key,A=p.value,w=Wo();A.forEach((V=>{if(!a.has(V)){const b=ta(e.get(V),s.get(V));b!==null&&w.set(V,b),a=a.add(V)}})),u.push(this.documentOverlayCache.saveOverlays(t,g,w))}return R.waitFor(u)})).next((()=>s))}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next((s=>this.recalculateAndSaveOverlays(t,s)))}getDocumentsMatchingQuery(t,e,s,i){return lc(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):uc(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,s,i):this.getDocumentsMatchingCollectionQuery(t,e,s,i)}getNextDocuments(t,e,s,i){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,s,i).next((a=>{const u=i-a.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,s.largestBatchId,i-a.size):R.resolve(Yt());let h=Qe,p=a;return u.next((g=>R.forEach(g,((A,w)=>(h<w.largestBatchId&&(h=w.largestBatchId),a.get(A)?R.resolve():this.remoteDocumentCache.getEntry(t,A).next((V=>{p=p.insert(A,V)}))))).next((()=>this.populateOverlays(t,g,a))).next((()=>this.computeViews(t,p,g,ct()))).next((A=>({batchId:h,changes:Qo(A)})))))}))}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new x(e)).next((s=>{let i=Sn();return s.isFoundDocument()&&(i=i.insert(s.key,s)),i}))}getDocumentsMatchingCollectionGroupQuery(t,e,s,i){const a=e.collectionGroup;let u=Sn();return this.indexManager.getCollectionParents(t,a).next((h=>R.forEach(h,(p=>{const g=(function(w,V){return new Jn(V,null,w.explicitOrderBy.slice(),w.filters.slice(),w.limit,w.limitType,w.startAt,w.endAt)})(e,p.child(a));return this.getDocumentsMatchingCollectionQuery(t,g,s,i).next((A=>{A.forEach(((w,V)=>{u=u.insert(w,V)}))}))})).next((()=>u))))}getDocumentsMatchingCollectionQuery(t,e,s,i){let a;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,s.largestBatchId).next((u=>(a=u,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,s,a,i)))).next((u=>{a.forEach(((p,g)=>{const A=g.getKey();u.get(A)===null&&(u=u.insert(A,vt.newInvalidDocument(A)))}));let h=Sn();return u.forEach(((p,g)=>{const A=a.get(p);A!==void 0&&Ge(A.mutation,g,wt.empty(),G.now()),as(e,g)&&(h=h.insert(p,g))})),h}))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class th{constructor(t){this.serializer=t,this.Or=new Map,this.Nr=new Map}getBundleMetadata(t,e){return R.resolve(this.Or.get(e))}saveBundleMetadata(t,e){return this.Or.set(e.id,(function(i){return{id:i.id,version:i.version,createTime:fe(i.createTime)}})(e)),R.resolve()}getNamedQuery(t,e){return R.resolve(this.Nr.get(e))}saveNamedQuery(t,e){return this.Nr.set(e.name,(function(i){return{name:i.name,query:qc(i.bundledQuery),readTime:fe(i.readTime)}})(e)),R.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(){this.overlays=new yt(x.comparator),this.Br=new Map}getOverlay(t,e){return R.resolve(this.overlays.get(e))}getOverlays(t,e){const s=Yt();return R.forEach(e,(i=>this.getOverlay(t,i).next((a=>{a!==null&&s.set(i,a)})))).next((()=>s))}saveOverlays(t,e,s){return s.forEach(((i,a)=>{this.wt(t,e,a)})),R.resolve()}removeOverlaysForBatchId(t,e,s){const i=this.Br.get(s);return i!==void 0&&(i.forEach((a=>this.overlays=this.overlays.remove(a))),this.Br.delete(s)),R.resolve()}getOverlaysForCollection(t,e,s){const i=Yt(),a=e.length+1,u=new x(e.child("")),h=this.overlays.getIteratorFrom(u);for(;h.hasNext();){const p=h.getNext().value,g=p.getKey();if(!e.isPrefixOf(g.path))break;g.path.length===a&&p.largestBatchId>s&&i.set(p.getKey(),p)}return R.resolve(i)}getOverlaysForCollectionGroup(t,e,s,i){let a=new yt(((g,A)=>g-A));const u=this.overlays.getIterator();for(;u.hasNext();){const g=u.getNext().value;if(g.getKey().getCollectionGroup()===e&&g.largestBatchId>s){let A=a.get(g.largestBatchId);A===null&&(A=Yt(),a=a.insert(g.largestBatchId,A)),A.set(g.getKey(),g)}}const h=Yt(),p=a.getIterator();for(;p.hasNext()&&(p.getNext().value.forEach(((g,A)=>h.set(g,A))),!(h.size()>=i)););return R.resolve(h)}wt(t,e,s){const i=this.overlays.get(s.key);if(i!==null){const u=this.Br.get(i.largestBatchId).delete(s.key);this.Br.set(i.largestBatchId,u)}this.overlays=this.overlays.insert(s.key,new Pc(e,s));let a=this.Br.get(e);a===void 0&&(a=ct(),this.Br.set(e,a)),this.Br.set(e,a.add(s.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nh{constructor(){this.sessionToken=Ct.EMPTY_BYTE_STRING}getSessionToken(t){return R.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,R.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(){this.Lr=new ot(et.kr),this.qr=new ot(et.Kr)}isEmpty(){return this.Lr.isEmpty()}addReference(t,e){const s=new et(t,e);this.Lr=this.Lr.add(s),this.qr=this.qr.add(s)}Ur(t,e){t.forEach((s=>this.addReference(s,e)))}removeReference(t,e){this.$r(new et(t,e))}Wr(t,e){t.forEach((s=>this.removeReference(s,e)))}Qr(t){const e=new x(new W([])),s=new et(e,t),i=new et(e,t+1),a=[];return this.qr.forEachInRange([s,i],(u=>{this.$r(u),a.push(u.key)})),a}Gr(){this.Lr.forEach((t=>this.$r(t)))}$r(t){this.Lr=this.Lr.delete(t),this.qr=this.qr.delete(t)}zr(t){const e=new x(new W([])),s=new et(e,t),i=new et(e,t+1);let a=ct();return this.qr.forEachInRange([s,i],(u=>{a=a.add(u.key)})),a}containsKey(t){const e=new et(t,0),s=this.Lr.firstAfterOrEqual(e);return s!==null&&t.isEqual(s.key)}}class et{constructor(t,e){this.key=t,this.jr=e}static kr(t,e){return x.comparator(t.key,e.key)||B(t.jr,e.jr)}static Kr(t,e){return B(t.jr,e.jr)||x.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rh{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Xn=1,this.Jr=new ot(et.kr)}checkEmpty(t){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,s,i){const a=this.Xn;this.Xn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const u=new Sc(a,e,s,i);this.mutationQueue.push(u);for(const h of i)this.Jr=this.Jr.add(new et(h.key,a)),this.indexManager.addToCollectionParentIndex(t,h.key.path.popLast());return R.resolve(u)}lookupMutationBatch(t,e){return R.resolve(this.Hr(e))}getNextMutationBatchAfterBatchId(t,e){const s=e+1,i=this.Zr(s),a=i<0?0:i;return R.resolve(this.mutationQueue.length>a?this.mutationQueue[a]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?ts:this.Xn-1)}getAllMutationBatches(t){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const s=new et(e,0),i=new et(e,Number.POSITIVE_INFINITY),a=[];return this.Jr.forEachInRange([s,i],(u=>{const h=this.Hr(u.jr);a.push(h)})),R.resolve(a)}getAllMutationBatchesAffectingDocumentKeys(t,e){let s=new ot(B);return e.forEach((i=>{const a=new et(i,0),u=new et(i,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([a,u],(h=>{s=s.add(h.jr)}))})),R.resolve(this.Xr(s))}getAllMutationBatchesAffectingQuery(t,e){const s=e.path,i=s.length+1;let a=s;x.isDocumentKey(a)||(a=a.child(""));const u=new et(new x(a),0);let h=new ot(B);return this.Jr.forEachWhile((p=>{const g=p.key.path;return!!s.isPrefixOf(g)&&(g.length===i&&(h=h.add(p.jr)),!0)}),u),R.resolve(this.Xr(h))}Xr(t){const e=[];return t.forEach((s=>{const i=this.Hr(s);i!==null&&e.push(i)})),e}removeMutationBatch(t,e){K(this.Yr(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let s=this.Jr;return R.forEach(e.mutations,(i=>{const a=new et(i.key,e.batchId);return s=s.delete(a),this.referenceDelegate.markPotentiallyOrphaned(t,i.key)})).next((()=>{this.Jr=s}))}tr(t){}containsKey(t,e){const s=new et(e,0),i=this.Jr.firstAfterOrEqual(s);return R.resolve(e.isEqual(i&&i.key))}performConsistencyCheck(t){return this.mutationQueue.length,R.resolve()}Yr(t,e){return this.Zr(t)}Zr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Hr(t){const e=this.Zr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sh{constructor(t){this.ei=t,this.docs=(function(){return new yt(x.comparator)})(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const s=e.key,i=this.docs.get(s),a=i?i.size:0,u=this.ei(e);return this.docs=this.docs.insert(s,{document:e.mutableCopy(),size:u}),this.size+=u-a,this.indexManager.addToCollectionParentIndex(t,s.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const s=this.docs.get(e);return R.resolve(s?s.document.mutableCopy():vt.newInvalidDocument(e))}getEntries(t,e){let s=qn();return e.forEach((i=>{const a=this.docs.get(i);s=s.insert(i,a?a.document.mutableCopy():vt.newInvalidDocument(i))})),R.resolve(s)}getDocumentsMatchingQuery(t,e,s,i){let a=qn();const u=e.path,h=new x(u.child("__id-9223372036854775808__")),p=this.docs.getIteratorFrom(h);for(;p.hasNext();){const{key:g,value:{document:A}}=p.getNext();if(!u.isPrefixOf(g.path))break;g.path.length>u.length+1||Mu(ku(A),s)<=0||(i.has(A.key)||as(e,A))&&(a=a.insert(A.key,A.mutableCopy()))}return R.resolve(a)}getAllFromCollectionGroup(t,e,s,i){k(9500)}ti(t,e){return R.forEach(this.docs,(s=>e(s)))}newChangeBuffer(t){return new ih(this)}getSize(t){return R.resolve(this.size)}}class ih extends Jc{constructor(t){super(),this.Fr=t}applyChanges(t){const e=[];return this.changes.forEach(((s,i)=>{i.isValidDocument()?e.push(this.Fr.addEntry(t,i)):this.Fr.removeEntry(s)})),R.waitFor(e)}getFromCache(t,e){return this.Fr.getEntry(t,e)}getAllFromCache(t,e){return this.Fr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oh{constructor(t){this.persistence=t,this.ni=new ie((e=>is(e)),os),this.lastRemoteSnapshotVersion=H.min(),this.highestTargetId=0,this.ri=0,this.ii=new hs,this.targetCount=0,this.si=qt.sr()}forEachTarget(t,e){return this.ni.forEach(((s,i)=>e(i))),R.resolve()}getLastRemoteSnapshotVersion(t){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return R.resolve(this.ri)}allocateTargetId(t){return this.highestTargetId=this.si.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(t,e,s){return s&&(this.lastRemoteSnapshotVersion=s),e>this.ri&&(this.ri=e),R.resolve()}cr(t){this.ni.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.si=new qt(e),this.highestTargetId=e),t.sequenceNumber>this.ri&&(this.ri=t.sequenceNumber)}addTargetData(t,e){return this.cr(e),this.targetCount+=1,R.resolve()}updateTargetData(t,e){return this.cr(e),R.resolve()}removeTargetData(t,e){return this.ni.delete(e.target),this.ii.Qr(e.targetId),this.targetCount-=1,R.resolve()}removeTargets(t,e,s){let i=0;const a=[];return this.ni.forEach(((u,h)=>{h.sequenceNumber<=e&&s.get(h.targetId)===null&&(this.ni.delete(u),a.push(this.removeMatchingKeysForTargetId(t,h.targetId)),i++)})),R.waitFor(a).next((()=>i))}getTargetCount(t){return R.resolve(this.targetCount)}getTargetData(t,e){const s=this.ni.get(e)||null;return R.resolve(s)}addMatchingKeys(t,e,s){return this.ii.Ur(e,s),R.resolve()}removeMatchingKeys(t,e,s){this.ii.Wr(e,s);const i=this.persistence.referenceDelegate,a=[];return i&&e.forEach((u=>{a.push(i.markPotentiallyOrphaned(t,u))})),R.waitFor(a)}removeMatchingKeysForTargetId(t,e){return this.ii.Qr(e),R.resolve()}getMatchingKeysForTargetId(t,e){const s=this.ii.zr(e);return R.resolve(s)}containsKey(t,e){return R.resolve(this.ii.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aa{constructor(t,e){this.oi={},this.overlays={},this._i=new Zr(0),this.ai=!1,this.ai=!0,this.ui=new nh,this.referenceDelegate=t(this),this.ci=new oh(this),this.indexManager=new Hc,this.remoteDocumentCache=(function(i){return new sh(i)})((s=>this.referenceDelegate.li(s))),this.serializer=new $c(e),this.hi=new th(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ai=!1,Promise.resolve()}get started(){return this.ai}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new eh,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let s=this.oi[t.toKey()];return s||(s=new rh(e,this.referenceDelegate),this.oi[t.toKey()]=s),s}getGlobalsCache(){return this.ui}getTargetCache(){return this.ci}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.hi}runTransaction(t,e,s){C("MemoryPersistence","Starting transaction:",t);const i=new ah(this._i.next());return this.referenceDelegate.Pi(),s(i).next((a=>this.referenceDelegate.Ti(i).next((()=>a)))).toPromise().then((a=>(i.raiseOnCommittedEvent(),a)))}Ii(t,e){return R.or(Object.values(this.oi).map((s=>()=>s.containsKey(t,e))))}}class ah extends Fu{constructor(t){super(),this.currentSequenceNumber=t}}class fs{constructor(t){this.persistence=t,this.Ei=new hs,this.Ri=null}static Ai(t){return new fs(t)}get Vi(){if(this.Ri)return this.Ri;throw k(60996)}addReference(t,e,s){return this.Ei.addReference(s,e),this.Vi.delete(s.toString()),R.resolve()}removeReference(t,e,s){return this.Ei.removeReference(s,e),this.Vi.add(s.toString()),R.resolve()}markPotentiallyOrphaned(t,e){return this.Vi.add(e.toString()),R.resolve()}removeTarget(t,e){this.Ei.Qr(e.targetId).forEach((i=>this.Vi.add(i.toString())));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(t,e.targetId).next((i=>{i.forEach((a=>this.Vi.add(a.toString())))})).next((()=>s.removeTargetData(t,e)))}Pi(){this.Ri=new Set}Ti(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.Vi,(s=>{const i=x.fromPath(s);return this.di(t,i).next((a=>{a||e.removeEntry(i,H.min())}))})).next((()=>(this.Ri=null,e.apply(t))))}updateLimboDocument(t,e){return this.di(t,e).next((s=>{s?this.Vi.delete(e.toString()):this.Vi.add(e.toString())}))}li(t){return 0}di(t,e){return R.or([()=>R.resolve(this.Ei.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ii(t,e)])}}class Qn{constructor(t,e){this.persistence=t,this.mi=new ie((s=>ju(s.path)),((s,i)=>s.isEqual(i))),this.garbageCollector=Xc(this,e)}static Ai(t,e){return new Qn(t,e)}Pi(){}Ti(t){return R.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}Vr(t){const e=this.gr(t);return this.persistence.getTargetCache().getTargetCount(t).next((s=>e.next((i=>s+i))))}gr(t){let e=0;return this.dr(t,(s=>{e++})).next((()=>e))}dr(t,e){return R.forEach(this.mi,((s,i)=>this.yr(t,s,i).next((a=>a?R.resolve():e(i)))))}removeTargets(t,e,s){return this.persistence.getTargetCache().removeTargets(t,e,s)}removeOrphanedDocuments(t,e){let s=0;const i=this.persistence.getRemoteDocumentCache(),a=i.newChangeBuffer();return i.ti(t,(u=>this.yr(t,u,e).next((h=>{h||(s++,a.removeEntry(u,H.min()))})))).next((()=>a.apply(t))).next((()=>s))}markPotentiallyOrphaned(t,e){return this.mi.set(e,t.currentSequenceNumber),R.resolve()}removeTarget(t,e){const s=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,s)}addReference(t,e,s){return this.mi.set(s,t.currentSequenceNumber),R.resolve()}removeReference(t,e,s){return this.mi.set(s,t.currentSequenceNumber),R.resolve()}updateLimboDocument(t,e){return this.mi.set(e,t.currentSequenceNumber),R.resolve()}li(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=bn(t.data.value)),e}yr(t,e,s){return R.or([()=>this.persistence.Ii(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const i=this.mi.get(e);return R.resolve(i!==void 0&&i>s)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(t,e,s,i){this.targetId=t,this.fromCache=e,this.Ps=s,this.Ts=i}static Is(t,e){let s=ct(),i=ct();for(const a of e.docChanges)switch(a.type){case 0:s=s.add(a.doc.key);break;case 1:i=i.add(a.doc.key)}return new ds(t,e.fromCache,s,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lh{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uh{constructor(){this.Es=!1,this.Rs=!1,this.As=100,this.Vs=(function(){return El()?8:Uu(_l())>0?6:4})()}initialize(t,e){this.ds=t,this.indexManager=e,this.Es=!0}getDocumentsMatchingQuery(t,e,s,i){const a={result:null};return this.fs(t,e).next((u=>{a.result=u})).next((()=>{if(!a.result)return this.gs(t,e,i,s).next((u=>{a.result=u}))})).next((()=>{if(a.result)return;const u=new lh;return this.ps(t,e,u).next((h=>{if(a.result=h,this.Rs)return this.ys(t,e,u,h.size)}))})).next((()=>a.result))}ys(t,e,s,i){return s.documentReadCount<this.As?(ce()<=U.DEBUG&&C("QueryEngine","SDK will not create cache indexes for query:",Fe(e),"since it only creates cache indexes for collection contains","more than or equal to",this.As,"documents"),R.resolve()):(ce()<=U.DEBUG&&C("QueryEngine","Query:",Fe(e),"scans",s.documentReadCount,"local documents and returns",i,"documents as results."),s.documentReadCount>this.Vs*i?(ce()<=U.DEBUG&&C("QueryEngine","The SDK decides to create cache indexes for query:",Fe(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,te(e))):R.resolve())}fs(t,e){if(ji(e))return R.resolve(null);let s=te(e);return this.indexManager.getIndexType(t,s).next((i=>i===0?null:(e.limit!==null&&i===1&&(e=jr(e,null,"F"),s=te(e)),this.indexManager.getDocumentsMatchingTarget(t,s).next((a=>{const u=ct(...a);return this.ds.getDocuments(t,u).next((h=>this.indexManager.getMinOffset(t,s).next((p=>{const g=this.ws(e,h);return this.Ss(e,g,u,p.readTime)?this.fs(t,jr(e,null,"F")):this.bs(t,g,e,p)}))))})))))}gs(t,e,s,i){return ji(e)||i.isEqual(H.min())?R.resolve(null):this.ds.getDocuments(t,s).next((a=>{const u=this.ws(e,a);return this.Ss(e,u,s,i)?R.resolve(null):(ce()<=U.DEBUG&&C("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Fe(e)),this.bs(t,u,e,xu(i,Qe)).next((h=>h)))}))}ws(t,e){let s=new ot(hc(t));return e.forEach(((i,a)=>{as(t,a)&&(s=s.add(a))})),s}Ss(t,e,s,i){if(t.limit===null)return!1;if(s.size!==e.size)return!0;const a=t.limitType==="F"?e.last():e.first();return!!a&&(a.hasPendingWrites||a.version.compareTo(i)>0)}ps(t,e,s){return ce()<=U.DEBUG&&C("QueryEngine","Using full collection scan to execute query:",Fe(e)),this.ds.getDocumentsMatchingQuery(t,e,jt.min(),s)}bs(t,e,s,i){return this.ds.getDocumentsMatchingQuery(t,s,i).next((a=>(e.forEach((u=>{a=a.insert(u.key,u)})),a)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch="LocalStore";class hh{constructor(t,e,s,i){this.persistence=t,this.Ds=e,this.serializer=i,this.Cs=new yt(B),this.vs=new ie((a=>is(a)),os),this.Fs=new Map,this.Ms=t.getRemoteDocumentCache(),this.ci=t.getTargetCache(),this.hi=t.getBundleCache(),this.xs(s)}xs(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Zc(this.Ms,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ms.setIndexManager(this.indexManager),this.Ds.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(e=>t.collect(e,this.Cs)))}}function fh(n,t,e,s){return new hh(n,t,e,s)}async function la(n,t){const e=$(n);return await e.persistence.runTransaction("Handle user change","readonly",(s=>{let i;return e.mutationQueue.getAllMutationBatches(s).next((a=>(i=a,e.xs(t),e.mutationQueue.getAllMutationBatches(s)))).next((a=>{const u=[],h=[];let p=ct();for(const g of i){u.push(g.batchId);for(const A of g.mutations)p=p.add(A.key)}for(const g of a){h.push(g.batchId);for(const A of g.mutations)p=p.add(A.key)}return e.localDocuments.getDocuments(s,p).next((g=>({Os:g,removedBatchIds:u,addedBatchIds:h})))}))}))}function dh(n,t){const e=$(n);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",(s=>{const i=t.batch.keys(),a=e.Ms.newChangeBuffer({trackRemovals:!0});return(function(h,p,g,A){const w=g.batch,V=w.keys();let b=R.resolve();return V.forEach((N=>{b=b.next((()=>A.getEntry(p,N))).next((L=>{const M=g.docVersions.get(N);K(M!==null,48541),L.version.compareTo(M)<0&&(w.applyToRemoteDocument(L,g),L.isValidDocument()&&(L.setReadTime(g.commitVersion),A.addEntry(L)))}))})),b.next((()=>h.mutationQueue.removeMutationBatch(p,w)))})(e,s,t,a).next((()=>a.apply(s))).next((()=>e.mutationQueue.performConsistencyCheck(s))).next((()=>e.documentOverlayCache.removeOverlaysForBatchId(s,i,t.batch.batchId))).next((()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,(function(h){let p=ct();for(let g=0;g<h.mutationResults.length;++g)h.mutationResults[g].transformResults.length>0&&(p=p.add(h.batch.mutations[g].key));return p})(t)))).next((()=>e.localDocuments.getDocuments(s,i)))}))}function ph(n){const t=$(n);return t.persistence.runTransaction("Get last remote snapshot version","readonly",(e=>t.ci.getLastRemoteSnapshotVersion(e)))}function mh(n,t){const e=$(n);return e.persistence.runTransaction("Get next mutation batch","readonly",(s=>(t===void 0&&(t=ts),e.mutationQueue.getNextMutationBatchAfterBatchId(s,t))))}class Xi{constructor(){this.activeTargetIds=_c()}Ws(t){this.activeTargetIds=this.activeTargetIds.add(t)}Qs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}$s(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class gh{constructor(){this.Co=new Xi,this.vo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,s){}addLocalQueryTarget(t,e=!0){return e&&this.Co.Ws(t),this.vo[t]||"not-current"}updateQueryState(t,e,s){this.vo[t]=e}removeLocalQueryTarget(t){this.Co.Qs(t)}isLocalQueryTarget(t){return this.Co.activeTargetIds.has(t)}clearQueryState(t){delete this.vo[t]}getAllActiveQueryTargets(){return this.Co.activeTargetIds}isActiveQueryTarget(t){return this.Co.activeTargetIds.has(t)}start(){return this.Co=new Xi,Promise.resolve()}handleUserChange(t,e,s){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h{Fo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ji="ConnectivityMonitor";class Yi{constructor(){this.Mo=()=>this.xo(),this.Oo=()=>this.No(),this.Bo=[],this.Lo()}Fo(t){this.Bo.push(t)}shutdown(){window.removeEventListener("online",this.Mo),window.removeEventListener("offline",this.Oo)}Lo(){window.addEventListener("online",this.Mo),window.addEventListener("offline",this.Oo)}xo(){C(Ji,"Network connectivity changed: AVAILABLE");for(const t of this.Bo)t(0)}No(){C(Ji,"Network connectivity changed: UNAVAILABLE");for(const t of this.Bo)t(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Pn=null;function Gr(){return Pn===null?Pn=(function(){return 268435456+Math.round(2147483648*Math.random())})():Pn++,"0x"+Pn.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dr="RestConnection",yh={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Eh{get ko(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.qo=e+"://"+t.host,this.Ko=`projects/${s}/databases/${i}`,this.Uo=this.databaseId.database===Lr?`project_id=${s}`:`project_id=${s}&database_id=${i}`}$o(t,e,s,i,a){const u=Gr(),h=this.Wo(t,e.toUriEncodedString());C(Dr,`Sending RPC '${t}' ${u}:`,h,s);const p={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Uo};this.Qo(p,i,a);const{host:g}=new URL(h),A=Rl(g);return this.Go(t,h,p,s,A).then((w=>(C(Dr,`Received RPC '${t}' ${u}: `,w),w)),(w=>{throw Ln(Dr,`RPC '${t}' ${u} failed with error: `,w,"url: ",h,"request:",s),w}))}zo(t,e,s,i,a,u){return this.$o(t,e,s,i,a)}Qo(t,e,s){t["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Te})(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach(((i,a)=>t[a]=i)),s&&s.headers.forEach(((i,a)=>t[a]=i))}Wo(t,e){const s=yh[t];let i=`${this.qo}/v1/${e}:${s}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Th{constructor(t){this.jo=t.jo,this.Jo=t.Jo}Ho(t){this.Zo=t}Xo(t){this.Yo=t}e_(t){this.t_=t}onMessage(t){this.n_=t}close(){this.Jo()}send(t){this.jo(t)}r_(){this.Zo()}i_(){this.Yo()}s_(t){this.t_(t)}o_(t){this.n_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ut="WebChannelConnection",Ue=(n,t,e)=>{n.listen(t,(s=>{try{e(s)}catch(i){setTimeout((()=>{throw i}),0)}}))};class de extends Eh{constructor(t){super(t),this.__=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}static a_(){if(!de.u_){const t=Ro();Ue(t,wo.STAT_EVENT,(e=>{e.stat===kr.PROXY?C(ut,"STAT_EVENT: detected buffering proxy"):e.stat===kr.NOPROXY&&C(ut,"STAT_EVENT: detected no buffering proxy")})),de.u_=!0}}Go(t,e,s,i,a){const u=Gr();return new Promise(((h,p)=>{const g=new Ao;g.setWithCredentials(!0),g.listenOnce(Io.COMPLETE,(()=>{try{switch(g.getLastErrorCode()){case Cn.NO_ERROR:const w=g.getResponseJson();C(ut,`XHR for RPC '${t}' ${u} received:`,JSON.stringify(w)),h(w);break;case Cn.TIMEOUT:C(ut,`RPC '${t}' ${u} timed out`),p(new D(S.DEADLINE_EXCEEDED,"Request time out"));break;case Cn.HTTP_ERROR:const V=g.getStatus();if(C(ut,`RPC '${t}' ${u} failed with status:`,V,"response text:",g.getResponseText()),V>0){let b=g.getResponseJson();Array.isArray(b)&&(b=b[0]);const N=b?.error;if(N&&N.status&&N.message){const L=(function(Q){const Y=Q.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(Y)>=0?Y:S.UNKNOWN})(N.status);p(new D(L,N.message))}else p(new D(S.UNKNOWN,"Server responded with status "+g.getStatus()))}else p(new D(S.UNAVAILABLE,"Connection failed."));break;default:k(9055,{c_:t,streamId:u,l_:g.getLastErrorCode(),h_:g.getLastError()})}}finally{C(ut,`RPC '${t}' ${u} completed.`)}}));const A=JSON.stringify(i);C(ut,`RPC '${t}' ${u} sending request:`,i),g.send(e,"POST",A,s,15)}))}P_(t,e,s){const i=Gr(),a=[this.qo,"/","google.firestore.v1.Firestore","/",t,"/channel"],u=this.createWebChannelTransport(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},p=this.longPollingOptions.timeoutSeconds;p!==void 0&&(h.longPollingTimeout=Math.round(1e3*p)),this.useFetchStreams&&(h.useFetchStreams=!0),this.Qo(h.initMessageHeaders,e,s),h.encodeInitMessageHeaders=!0;const g=a.join("");C(ut,`Creating RPC '${t}' stream ${i}: ${g}`,h);const A=u.createWebChannel(g,h);this.T_(A);let w=!1,V=!1;const b=new Th({jo:N=>{V?C(ut,`Not sending because RPC '${t}' stream ${i} is closed:`,N):(w||(C(ut,`Opening RPC '${t}' stream ${i} transport.`),A.open(),w=!0),C(ut,`RPC '${t}' stream ${i} sending:`,N),A.send(N))},Jo:()=>A.close()});return Ue(A,Be.EventType.OPEN,(()=>{V||(C(ut,`RPC '${t}' stream ${i} transport opened.`),b.r_())})),Ue(A,Be.EventType.CLOSE,(()=>{V||(V=!0,C(ut,`RPC '${t}' stream ${i} transport closed`),b.s_(),this.I_(A))})),Ue(A,Be.EventType.ERROR,(N=>{V||(V=!0,Ln(ut,`RPC '${t}' stream ${i} transport errored. Name:`,N.name,"Message:",N.message),b.s_(new D(S.UNAVAILABLE,"The operation could not be completed")))})),Ue(A,Be.EventType.MESSAGE,(N=>{if(!V){const L=N.data[0];K(!!L,16349);const M=L,Q=M?.error||M[0]?.error;if(Q){C(ut,`RPC '${t}' stream ${i} received error:`,Q);const Y=Q.status;let at=(function(pt){const y=X[pt];if(y!==void 0)return Cc(y)})(Y),Tt=Q.message;Y==="NOT_FOUND"&&Tt.includes("database")&&Tt.includes("does not exist")&&Tt.includes(this.databaseId.database)&&Ln(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),at===void 0&&(at=S.INTERNAL,Tt="Unknown error status: "+Y+" with message "+Q.message),V=!0,b.s_(new D(at,Tt)),A.close()}else C(ut,`RPC '${t}' stream ${i} received:`,L),b.o_(L)}})),de.a_(),setTimeout((()=>{b.i_()}),0),b}terminate(){this.__.forEach((t=>t.close())),this.__=[]}T_(t){this.__.push(t)}I_(t){this.__=this.__.filter((e=>e===t))}Qo(t,e,s){super.Qo(t,e,s),this.databaseInfo.apiKey&&(t["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return So()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vh(n){return new de(n)}function Nr(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function er(n){return new bc(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */de.u_=!1;class ua{constructor(t,e,s=1e3,i=1.5,a=6e4){this.Di=t,this.timerId=e,this.E_=s,this.R_=i,this.A_=a,this.V_=0,this.d_=null,this.m_=Date.now(),this.reset()}reset(){this.V_=0}f_(){this.V_=this.A_}g_(t){this.cancel();const e=Math.floor(this.V_+this.p_()),s=Math.max(0,Date.now()-this.m_),i=Math.max(0,e-s);i>0&&C("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.V_} ms, delay with jitter: ${e} ms, last attempt: ${s} ms ago)`),this.d_=this.Di.enqueueAfterDelay(this.timerId,i,(()=>(this.m_=Date.now(),t()))),this.V_*=this.R_,this.V_<this.E_&&(this.V_=this.E_),this.V_>this.A_&&(this.V_=this.A_)}y_(){this.d_!==null&&(this.d_.skipDelay(),this.d_=null)}cancel(){this.d_!==null&&(this.d_.cancel(),this.d_=null)}p_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zi="PersistentStream";class Ah{constructor(t,e,s,i,a,u,h,p){this.Di=t,this.w_=s,this.S_=i,this.connection=a,this.authCredentialsProvider=u,this.appCheckCredentialsProvider=h,this.listener=p,this.state=0,this.b_=0,this.D_=null,this.C_=null,this.stream=null,this.v_=0,this.F_=new ua(t,e)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.v_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Di.enqueueAfterDelay(this.w_,6e4,(()=>this.L_())))}k_(t){this.q_(),this.stream.send(t)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}K_(){this.C_&&(this.C_.cancel(),this.C_=null)}async close(t,e){this.q_(),this.K_(),this.F_.cancel(),this.b_++,t!==4?this.F_.reset():e&&e.code===S.RESOURCE_EXHAUSTED?(ne(e.toString()),ne("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):e&&e.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.e_(e)}U_(){}auth(){this.state=1;const t=this.W_(this.b_),e=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([s,i])=>{this.b_===e&&this.Q_(s,i)}),(s=>{t((()=>{const i=new D(S.UNKNOWN,"Fetching auth token failed: "+s.message);return this.G_(i)}))}))}Q_(t,e){const s=this.W_(this.b_);this.stream=this.z_(t,e),this.stream.Ho((()=>{s((()=>this.listener.Ho()))})),this.stream.Xo((()=>{s((()=>(this.state=2,this.C_=this.Di.enqueueAfterDelay(this.S_,1e4,(()=>(this.x_()&&(this.state=3),Promise.resolve()))),this.listener.Xo())))})),this.stream.e_((i=>{s((()=>this.G_(i)))})),this.stream.onMessage((i=>{s((()=>++this.v_==1?this.j_(i):this.onNext(i)))}))}O_(){this.state=5,this.F_.g_((async()=>{this.state=0,this.start()}))}G_(t){return C(Zi,`close with error: ${t}`),this.stream=null,this.close(4,t)}W_(t){return e=>{this.Di.enqueueAndForget((()=>this.b_===t?e():(C(Zi,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class Ih extends Ah{constructor(t,e,s,i,a,u){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,s,i,u),this.serializer=a}get X_(){return this.v_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.X_&&this.Y_([])}z_(t,e){return this.connection.P_("Write",t,e)}j_(t){return K(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,K(!t.writeResults||t.writeResults.length===0,55816),this.listener.ea()}onNext(t){K(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.F_.reset();const e=Fc(t.writeResults,t.commitTime),s=fe(t.commitTime);return this.listener.ta(s,e)}na(){const t={};t.database=kc(this.serializer),this.k_(t)}Y_(t){const e={streamToken:this.lastStreamToken,writes:t.map((s=>Lc(this.serializer,s)))};this.k_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wh{}class Rh extends wh{constructor(t,e,s,i){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=s,this.serializer=i,this.ra=!1}ia(){if(this.ra)throw new D(S.FAILED_PRECONDITION,"The client has already been terminated.")}$o(t,e,s,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,u])=>this.connection.$o(t,qr(e,s),i,a,u))).catch((a=>{throw a.name==="FirebaseError"?(a.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new D(S.UNKNOWN,a.toString())}))}zo(t,e,s,i,a){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([u,h])=>this.connection.zo(t,qr(e,s),i,u,h,a))).catch((u=>{throw u.name==="FirebaseError"?(u.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),u):new D(S.UNKNOWN,u.toString())}))}terminate(){this.ra=!0,this.connection.terminate()}}function Sh(n,t,e,s){return new Rh(n,t,e,s)}class Ph{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve()))))}la(t){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ua("Offline")))}set(t){this.ha(),this.sa=0,t==="Online"&&(this._a=!1),this.ua(t)}ua(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}ca(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(ne(e),this._a=!1):C("OnlineStateTracker",e)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sn="RemoteStore";class Vh{constructor(t,e,s,i,a){this.localStore=t,this.datastore=e,this.asyncQueue=s,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Map,this.Ea=new Map,this.Ra=new qt(1e3),this.Aa=new qt(1001),this.Va=new Set,this.da=[],this.ma=a,this.ma.Fo((u=>{s.enqueueAndForget((async()=>{an(this)&&(C(sn,"Restarting streams for network reachability change."),await(async function(p){const g=$(p);g.Va.add(4),await on(g),g.fa.set("Unknown"),g.Va.delete(4),await nr(g)})(this))}))})),this.fa=new Ph(s,i)}}async function nr(n){if(an(n))for(const t of n.da)await t(!0)}async function on(n){for(const t of n.da)await t(!1)}function an(n){return $(n).Va.size===0}async function ca(n,t,e){if(!nn(t))throw t;n.Va.add(1),await on(n),n.fa.set("Offline"),e||(e=()=>ph(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{C(sn,"Retrying IndexedDB access"),await e(),n.Va.delete(1),await nr(n)}))}function ha(n,t){return t().catch((e=>ca(n,e,t)))}async function rr(n){const t=$(n),e=Ht(t);let s=t.Pa.length>0?t.Pa[t.Pa.length-1].batchId:ts;for(;Ch(t);)try{const i=await mh(t.localStore,s);if(i===null){t.Pa.length===0&&e.B_();break}s=i.batchId,bh(t,i)}catch(i){await ca(t,i)}fa(t)&&da(t)}function Ch(n){return an(n)&&n.Pa.length<10}function bh(n,t){n.Pa.push(t);const e=Ht(n);e.x_()&&e.X_&&e.Y_(t.mutations)}function fa(n){return an(n)&&!Ht(n).M_()&&n.Pa.length>0}function da(n){Ht(n).start()}async function Dh(n){Ht(n).na()}async function Nh(n){const t=Ht(n);for(const e of n.Pa)t.Y_(e.mutations)}async function Oh(n,t,e){const s=n.Pa.shift(),i=cs.from(s,t,e);await ha(n,(()=>n.remoteSyncer.applySuccessfulWrite(i))),await rr(n)}async function xh(n,t){t&&Ht(n).X_&&await(async function(s,i){if((function(u){return Vc(u)&&u!==S.ABORTED})(i.code)){const a=s.Pa.shift();Ht(s).N_(),await ha(s,(()=>s.remoteSyncer.rejectFailedWrite(a.batchId,i))),await rr(s)}})(n,t),fa(n)&&da(n)}async function to(n,t){const e=$(n);e.asyncQueue.verifyOperationInProgress(),C(sn,"RemoteStore received new credentials");const s=an(e);e.Va.add(3),await on(e),s&&e.fa.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Va.delete(3),await nr(e)}async function kh(n,t){const e=$(n);t?(e.Va.delete(2),await nr(e)):t||(e.Va.add(2),await on(e),e.fa.set("Unknown"))}function Ht(n){return n.ya||(n.ya=(function(e,s,i){const a=$(e);return a.ia(),new Ih(s,a.connection,a.authCredentials,a.appCheckCredentials,a.serializer,i)})(n.datastore,n.asyncQueue,{Ho:()=>Promise.resolve(),Xo:Dh.bind(null,n),e_:xh.bind(null,n),ea:Nh.bind(null,n),ta:Oh.bind(null,n)}),n.da.push((async t=>{t?(n.ya.N_(),await rr(n)):(await n.ya.stop(),n.Pa.length>0&&(C(sn,`Stopping write stream with ${n.Pa.length} pending writes`),n.Pa=[]))}))),n.ya}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(t,e,s,i,a){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=s,this.op=i,this.removalCallback=a,this.deferred=new Zt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((u=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(t,e,s,i,a){const u=Date.now()+s,h=new ps(t,e,u,i,a);return h.start(s),h}start(t){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(S.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((t=>this.deferred.resolve(t)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function pa(n,t){if(ne("AsyncQueue",`${t}: ${n}`),nn(n))return new D(S.UNAVAILABLE,`${t}: ${n}`);throw n}class Mh{constructor(){this.queries=eo(),this.onlineState="Unknown",this.Ma=new Set}terminate(){(function(e,s){const i=$(e),a=i.queries;i.queries=eo(),a.forEach(((u,h)=>{for(const p of h.Ca)p.onError(s)}))})(this,new D(S.ABORTED,"Firestore shutting down"))}}function eo(){return new ie((n=>zo(n)),Go)}function Lh(n){n.Ma.forEach((t=>{t.next()}))}var no,ro;(ro=no||(no={})).Na="default",ro.Cache="cache";const Fh="SyncEngine";class Uh{constructor(t,e,s,i,a,u){this.localStore=t,this.remoteStore=e,this.eventManager=s,this.sharedClientState=i,this.currentUser=a,this.maxConcurrentLimboResolutions=u,this.Eu={},this.Ru=new ie((h=>zo(h)),Go),this.Au=new Map,this.Vu=new Set,this.du=new yt(x.comparator),this.mu=new Map,this.fu=new hs,this.gu={},this.pu=new Map,this.yu=qt._r(),this.onlineState="Unknown",this.wu=void 0}get isPrimaryClient(){return this.wu===!0}}async function Bh(n,t,e){const s=Hh(n);try{const i=await(function(u,h){const p=$(u),g=G.now(),A=h.reduce(((b,N)=>b.add(N.key)),ct());let w,V;return p.persistence.runTransaction("Locally write mutations","readwrite",(b=>{let N=qn(),L=ct();return p.Ms.getEntries(b,A).next((M=>{N=M,N.forEach(((Q,Y)=>{Y.isValidDocument()||(L=L.add(Q))}))})).next((()=>p.localDocuments.getOverlayedDocuments(b,N))).next((M=>{w=M;const Q=[];for(const Y of h){const at=wc(Y,w.get(Y.key).overlayedDocument);at!=null&&Q.push(new oe(Y.key,at,Fo(at.value.mapValue),Nt.exists(!0)))}return p.mutationQueue.addMutationBatch(b,g,Q,h)})).next((M=>{V=M;const Q=M.applyToLocalDocumentSet(w,L);return p.documentOverlayCache.saveOverlays(b,M.batchId,Q)}))})).then((()=>({batchId:V.batchId,changes:Qo(w)})))})(s.localStore,t);s.sharedClientState.addPendingMutation(i.batchId),(function(u,h,p){let g=u.gu[u.currentUser.toKey()];g||(g=new yt(B)),g=g.insert(h,p),u.gu[u.currentUser.toKey()]=g})(s,i.batchId,e),await sr(s,i.changes),await rr(s.remoteStore)}catch(i){const a=pa(i,"Failed to persist write");e.reject(a)}}function so(n,t,e){const s=$(n);if(s.isPrimaryClient&&e===0||!s.isPrimaryClient&&e===1){const i=[];s.Ru.forEach(((a,u)=>{const h=u.view.xa(t);h.snapshot&&i.push(h.snapshot)})),(function(u,h){const p=$(u);p.onlineState=h;let g=!1;p.queries.forEach(((A,w)=>{for(const V of w.Ca)V.xa(h)&&(g=!0)})),g&&Lh(p)})(s.eventManager,t),i.length&&s.Eu.J_(i),s.onlineState=t,s.isPrimaryClient&&s.sharedClientState.setOnlineState(t)}}async function jh(n,t){const e=$(n),s=t.batch.batchId;try{const i=await dh(e.localStore,t);ga(e,s,null),ma(e,s),e.sharedClientState.updateMutationState(s,"acknowledged"),await sr(e,i)}catch(i){await Yr(i)}}async function $h(n,t,e){const s=$(n);try{const i=await(function(u,h){const p=$(u);return p.persistence.runTransaction("Reject batch","readwrite-primary",(g=>{let A;return p.mutationQueue.lookupMutationBatch(g,h).next((w=>(K(w!==null,37113),A=w.keys(),p.mutationQueue.removeMutationBatch(g,w)))).next((()=>p.mutationQueue.performConsistencyCheck(g))).next((()=>p.documentOverlayCache.removeOverlaysForBatchId(g,A,h))).next((()=>p.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(g,A))).next((()=>p.localDocuments.getDocuments(g,A)))}))})(s.localStore,t);ga(s,t,e),ma(s,t),s.sharedClientState.updateMutationState(t,"rejected",e),await sr(s,i)}catch(i){await Yr(i)}}function ma(n,t){(n.pu.get(t)||[]).forEach((e=>{e.resolve()})),n.pu.delete(t)}function ga(n,t,e){const s=$(n);let i=s.gu[s.currentUser.toKey()];if(i){const a=i.get(t);a&&(e?a.reject(e):a.resolve(),i=i.remove(t)),s.gu[s.currentUser.toKey()]=i}}async function sr(n,t,e){const s=$(n),i=[],a=[],u=[];s.Ru.isEmpty()||(s.Ru.forEach(((h,p)=>{u.push(s.Su(p,t,e).then((g=>{if((g||e)&&s.isPrimaryClient){const A=g?!g.fromCache:e?.targetChanges.get(p.targetId)?.current;s.sharedClientState.updateQueryState(p.targetId,A?"current":"not-current")}if(g){i.push(g);const A=ds.Is(p.targetId,g);a.push(A)}})))})),await Promise.all(u),s.Eu.J_(i),await(async function(p,g){const A=$(p);try{await A.persistence.runTransaction("notifyLocalViewChanges","readwrite",(w=>R.forEach(g,(V=>R.forEach(V.Ps,(b=>A.persistence.referenceDelegate.addReference(w,V.targetId,b))).next((()=>R.forEach(V.Ts,(b=>A.persistence.referenceDelegate.removeReference(w,V.targetId,b)))))))))}catch(w){if(!nn(w))throw w;C(ch,"Failed to update sequence numbers: "+w)}for(const w of g){const V=w.targetId;if(!w.fromCache){const b=A.Cs.get(V),N=b.snapshotVersion,L=b.withLastLimboFreeSnapshotVersion(N);A.Cs=A.Cs.insert(V,L)}}})(s.localStore,a))}async function qh(n,t){const e=$(n);if(!e.currentUser.isEqual(t)){C(Fh,"User change. New user:",t.toKey());const s=await la(e.localStore,t);e.currentUser=t,(function(a,u){a.pu.forEach((h=>{h.forEach((p=>{p.reject(new D(S.CANCELLED,u))}))})),a.pu.clear()})(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,s.removedBatchIds,s.addedBatchIds),await sr(e,s.Os)}}function Hh(n){const t=$(n);return t.remoteStore.remoteSyncer.applySuccessfulWrite=jh.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=$h.bind(null,t),t}class Wn{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=er(t.databaseInfo.databaseId),this.sharedClientState=this.Fu(t),this.persistence=this.Mu(t),await this.persistence.start(),this.localStore=this.xu(t),this.gcScheduler=this.Ou(t,this.localStore),this.indexBackfillerScheduler=this.Nu(t,this.localStore)}Ou(t,e){return null}Nu(t,e){return null}xu(t){return fh(this.persistence,new uh,t.initialUser,this.serializer)}Mu(t){return new aa(fs.Ai,this.serializer)}Fu(t){return new gh}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Wn.provider={build:()=>new Wn};class Gh extends Wn{constructor(t){super(),this.cacheSizeBytes=t}Ou(t,e){K(this.persistence.referenceDelegate instanceof Qn,46915);const s=this.persistence.referenceDelegate.garbageCollector;return new Qc(s,t.asyncQueue,e)}Mu(t){const e=this.cacheSizeBytes!==void 0?_t.withCacheSize(this.cacheSizeBytes):_t.DEFAULT;return new aa((s=>Qn.Ai(s,e)),this.serializer)}}class zr{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>so(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=qh.bind(null,this.syncEngine),await kh(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return(function(){return new Mh})()}createDatastore(t){const e=er(t.databaseInfo.databaseId),s=vh(t.databaseInfo);return Sh(t.authCredentials,t.appCheckCredentials,s,e)}createRemoteStore(t){return(function(s,i,a,u,h){return new Vh(s,i,a,u,h)})(this.localStore,this.datastore,t.asyncQueue,(e=>so(this.syncEngine,e,0)),(function(){return Yi.v()?new Yi:new _h})())}createSyncEngine(t,e){return(function(i,a,u,h,p,g,A){const w=new Uh(i,a,u,h,p,g);return A&&(w.wu=!0),w})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){await(async function(e){const s=$(e);C(sn,"RemoteStore shutting down."),s.Va.add(5),await on(s),s.ma.shutdown(),s.fa.set("Unknown")})(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}zr.provider={build:()=>new zr};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt="FirestoreClient";class zh{constructor(t,e,s,i,a){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=s,this._databaseInfo=i,this.user=gt.UNAUTHENTICATED,this.clientId=Xr.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=a,this.authCredentials.start(s,(async u=>{C(Gt,"Received user=",u.uid),await this.authCredentialListener(u),this.user=u})),this.appCheckCredentials.start(s,(u=>(C(Gt,"Received new app check token=",u),this.appCheckCredentialListener(u,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Zt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const s=pa(e,"Failed to shutdown persistence");t.reject(s)}})),t.promise}}async function Or(n,t){n.asyncQueue.verifyOperationInProgress(),C(Gt,"Initializing OfflineComponentProvider");const e=n.configuration;await t.initialize(e);let s=e.initialUser;n.setCredentialChangeListener((async i=>{s.isEqual(i)||(await la(t.localStore,i),s=i)})),t.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=t}async function io(n,t){n.asyncQueue.verifyOperationInProgress();const e=await Kh(n);C(Gt,"Initializing OnlineComponentProvider"),await t.initialize(e,n.configuration),n.setCredentialChangeListener((s=>to(t.remoteStore,s))),n.setAppCheckTokenChangeListener(((s,i)=>to(t.remoteStore,i))),n._onlineComponents=t}async function Kh(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){C(Gt,"Using user provided OfflineComponentProvider");try{await Or(n,n._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!(function(i){return i.name==="FirebaseError"?i.code===S.FAILED_PRECONDITION||i.code===S.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11})(e))throw e;Ln("Error using user provided cache. Falling back to memory cache: "+e),await Or(n,new Wn)}}else C(Gt,"Using default OfflineComponentProvider"),await Or(n,new Gh(void 0));return n._offlineComponents}async function Qh(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(C(Gt,"Using user provided OnlineComponentProvider"),await io(n,n._uninitializedComponentsProvider._online)):(C(Gt,"Using default OnlineComponentProvider"),await io(n,new zr))),n._onlineComponents}function Wh(n){return Qh(n).then((t=>t.syncEngine))}function Xh(n,t){const e=new Zt;return n.asyncQueue.enqueueAndForget((async()=>Bh(await Wh(n),t,e))),e.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _a(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jh="ComponentProvider",oo=new Map;function Yh(n,t,e,s,i){return new Gu(n,t,e,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,_a(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zh="firestore.googleapis.com",ao=!0;class lo{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new D(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Zh,this.ssl=ao}else this.host=t.host,this.ssl=t.ssl??ao;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=oa;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<zc)throw new D(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}Ou("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=_a(t.experimentalLongPollingOptions??{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new D(S.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&(function(s,i){return s.timeoutSeconds===i.timeoutSeconds})(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class ya{constructor(t,e,s,i){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=s,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new lo({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new D(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new lo(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=(function(s){if(!s)return new Iu;switch(s.type){case"firstParty":return new Su(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new D(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(e){const s=oo.get(e);s&&(C(Jh,"Removing Datastore"),oo.delete(e),s.terminate())})(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(t,e,s){this.converter=e,this._query=s,this.type="query",this.firestore=t}withConverter(t){return new ms(this.firestore,t,this._query)}}class ht{constructor(t,e,s){this.converter=e,this._key=s,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new tn(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new ht(this.firestore,t,this._key)}toJSON(){return{type:ht._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,s){if(en(e,ht._jsonSchema))return new ht(t,s||null,new x(W.fromString(e.referencePath)))}}ht._jsonSchemaVersion="firestore/documentReference/1.0",ht._jsonSchema={type:J("string",ht._jsonSchemaVersion),referencePath:J("string")};class tn extends ms{constructor(t,e,s){super(t,e,ac(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new ht(this.firestore,null,new x(t))}withConverter(t){return new tn(this.firestore,t,this._path)}}function _f(n,t,...e){if(n=xn(n),arguments.length===1&&(t=Xr.newId()),Nu("doc","path",t),n instanceof ya){const s=W.fromString(t,...e);return Ci(s),new ht(n,null,new x(s))}{if(!(n instanceof ht||n instanceof tn))throw new D(S.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=n._path.child(W.fromString(t,...e));return Ci(s),new ht(n.firestore,n instanceof tn?n.converter:null,new x(s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uo="AsyncQueue";class co{constructor(t=Promise.resolve()){this.nc=[],this.rc=!1,this.sc=[],this.oc=null,this._c=!1,this.ac=!1,this.uc=[],this.F_=new ua(this,"async_queue_retry"),this.cc=()=>{const s=Nr();s&&C(uo,"Visibility state changed to "+s.visibilityState),this.F_.y_()},this.lc=t;const e=Nr();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.cc)}get isShuttingDown(){return this.rc}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.hc(),this.Pc(t)}enterRestrictedMode(t){if(!this.rc){this.rc=!0,this.ac=t||!1;const e=Nr();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.cc)}}enqueue(t){if(this.hc(),this.rc)return new Promise((()=>{}));const e=new Zt;return this.Pc((()=>this.rc&&this.ac?Promise.resolve():(t().then(e.resolve,e.reject),e.promise))).then((()=>e.promise))}enqueueRetryable(t){this.enqueueAndForget((()=>(this.nc.push(t),this.Tc())))}async Tc(){if(this.nc.length!==0){try{await this.nc[0](),this.nc.shift(),this.F_.reset()}catch(t){if(!nn(t))throw t;C(uo,"Operation failed with retryable error: "+t)}this.nc.length>0&&this.F_.g_((()=>this.Tc()))}}Pc(t){const e=this.lc.then((()=>(this._c=!0,t().catch((s=>{throw this.oc=s,this._c=!1,ne("INTERNAL UNHANDLED ERROR: ",ho(s)),s})).then((s=>(this._c=!1,s))))));return this.lc=e,e}enqueueAfterDelay(t,e,s){this.hc(),this.uc.indexOf(t)>-1&&(e=0);const i=ps.createAndSchedule(this,t,e,s,(a=>this.Ic(a)));return this.sc.push(i),i}hc(){this.oc&&k(47125,{Ec:ho(this.oc)})}verifyOperationInProgress(){}async Rc(){let t;do t=this.lc,await t;while(t!==this.lc)}Ac(t){for(const e of this.sc)if(e.timerId===t)return!0;return!1}Vc(t){return this.Rc().then((()=>{this.sc.sort(((e,s)=>e.targetTimeMs-s.targetTimeMs));for(const e of this.sc)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Rc()}))}dc(t){this.uc.push(t)}Ic(t){const e=this.sc.indexOf(t);this.sc.splice(e,1)}}function ho(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}class Ea extends ya{constructor(t,e,s,i){super(t,e,s,i),this.type="firestore",this._queue=new co,this._persistenceKey=i?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new co(t),this._firestoreClient=void 0,await t}}}function tf(n){if(n._terminated)throw new D(S.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||ef(n),n._firestoreClient}function ef(n){const t=n._freezeSettings(),e=Yh(n._databaseId,n._app?.options.appId||"",n._persistenceKey,n._app?.options.apiKey,t);n._componentsProvider||t.localCache?._offlineComponentProvider&&t.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),n._firestoreClient=new zh(n._authCredentials,n._appCheckCredentials,n._queue,e,n._componentsProvider&&(function(i){const a=i?._online.build();return{_offline:i?._offline.build(a),_online:a}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It{constructor(t){this._byteString=t}static fromBase64String(t){try{return new It(Ct.fromBase64String(t))}catch(e){throw new D(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new It(Ct.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:It._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(en(t,It._jsonSchema))return It.fromBase64String(t.bytes)}}It._jsonSchemaVersion="firestore/bytes/1.0",It._jsonSchema={type:J("string",It._jsonSchemaVersion),bytes:J("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ta{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new D(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new it(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new D(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new D(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return B(this._lat,t._lat)||B(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ot._jsonSchemaVersion}}static fromJSON(t){if(en(t,Ot._jsonSchema))return new Ot(t.latitude,t.longitude)}}Ot._jsonSchemaVersion="firestore/geoPoint/1.0",Ot._jsonSchema={type:J("string",Ot._jsonSchemaVersion),latitude:J("number"),longitude:J("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(t){this._values=(t||[]).map((e=>e))}toArray(){return this._values.map((t=>t))}isEqual(t){return(function(s,i){if(s.length!==i.length)return!1;for(let a=0;a<s.length;++a)if(s[a]!==i[a])return!1;return!0})(this._values,t._values)}toJSON(){return{type:Vt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(en(t,Vt._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every((e=>typeof e=="number")))return new Vt(t.vectorValues);throw new D(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Vt._jsonSchemaVersion="firestore/vectorValue/1.0",Vt._jsonSchema={type:J("string",Vt._jsonSchemaVersion),vectorValues:J("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nf=/^__.*__$/;class rf{constructor(t,e,s){this.data=t,this.fieldMask=e,this.fieldTransforms=s}toMutation(t,e){return this.fieldMask!==null?new oe(t,this.data,this.fieldMask,e,this.fieldTransforms):new rn(t,this.data,e,this.fieldTransforms)}}function Aa(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw k(40011,{dataSource:n})}}class gs{constructor(t,e,s,i,a,u){this.settings=t,this.databaseId=e,this.serializer=s,this.ignoreUndefinedProperties=i,a===void 0&&this.mc(),this.fieldTransforms=a||[],this.fieldMask=u||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(t){return new gs({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}gc(t){const e=this.path?.child(t),s=this.i({path:e,arrayElement:!1});return s.yc(t),s}wc(t){const e=this.path?.child(t),s=this.i({path:e,arrayElement:!1});return s.mc(),s}Sc(t){return this.i({path:void 0,arrayElement:!0})}bc(t){return Xn(t,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(t){return this.fieldMask.find((e=>t.isPrefixOf(e)))!==void 0||this.fieldTransforms.find((e=>t.isPrefixOf(e.field)))!==void 0}mc(){if(this.path)for(let t=0;t<this.path.length;t++)this.yc(this.path.get(t))}yc(t){if(t.length===0)throw this.bc("Document fields must not be empty");if(Aa(this.dataSource)&&nf.test(t))throw this.bc('Document fields cannot begin and end with "__"')}}class sf{constructor(t,e,s){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=s||er(t)}V(t,e,s,i=!1){return new gs({dataSource:t,methodName:e,targetDoc:s,path:it.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function of(n){const t=n._freezeSettings(),e=er(n._databaseId);return new sf(n._databaseId,!!t.ignoreUndefinedProperties,e)}function af(n,t,e,s,i,a={}){const u=n.V(a.merge||a.mergeFields?2:0,t,e,i);Sa("Data must be an object, but it was:",u,s);const h=wa(s,u);let p,g;if(a.merge)p=new wt(u.fieldMask),g=u.fieldTransforms;else if(a.mergeFields){const A=[];for(const w of a.mergeFields){const V=_s(t,w,e);if(!u.contains(V))throw new D(S.INVALID_ARGUMENT,`Field '${V}' is specified in your field mask but missing from your input data.`);cf(A,V)||A.push(V)}p=new wt(A),g=u.fieldTransforms.filter((w=>p.covers(w.field)))}else p=null,g=u.fieldTransforms;return new rf(new At(h),p,g)}function Ia(n,t){if(Ra(n=xn(n)))return Sa("Unsupported field value:",t,n),wa(n,t);if(n instanceof va)return(function(s,i){if(!Aa(i.dataSource))throw i.bc(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.bc(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.arrayElement&&t.dataSource!==4)throw t.bc("Nested arrays are not supported");return(function(s,i){const a=[];let u=0;for(const h of s){let p=Ia(h,i.Sc(u));p==null&&(p={nullValue:"NULL_VALUE"}),a.push(p),u++}return{arrayValue:{values:a}}})(n,t)}return(function(s,i){if((s=xn(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return yc(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const a=G.fromDate(s);return{timestampValue:$r(i.serializer,a)}}if(s instanceof G){const a=new G(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:$r(i.serializer,a)}}if(s instanceof Ot)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof It)return{bytesValue:Dc(i.serializer,s._byteString)};if(s instanceof ht){const a=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(a))throw i.bc(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:ra(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Vt)return(function(u,h){const p=u instanceof Vt?u.toArray():u;return{mapValue:{fields:{[ko]:{stringValue:Mo},[Fr]:{arrayValue:{values:p.map((A=>{if(typeof A!="number")throw h.bc("VectorValues must only contain numeric values.");return Yn(h.serializer,A)}))}}}}}})(s,i);if(ia(s))return s._toProto(i.serializer);throw i.bc(`Unsupported field value: ${Jr(s)}`)})(n,t)}function wa(n,t){const e={};return bo(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):ve(n,((s,i)=>{const a=Ia(i,t.gc(s));a!=null&&(e[s]=a)})),{mapValue:{fields:e}}}function Ra(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof G||n instanceof Ot||n instanceof It||n instanceof ht||n instanceof va||n instanceof Vt||ia(n))}function Sa(n,t,e){if(!Ra(e)||!Vo(e)){const s=Jr(e);throw s==="an object"?t.bc(n+" a custom object"):t.bc(n+" "+s)}}function _s(n,t,e){if((t=xn(t))instanceof Ta)return t._internalPath;if(typeof t=="string")return uf(n,t);throw Xn("Field path arguments must be of type string or ",n,!1,void 0,e)}const lf=new RegExp("[~\\*/\\[\\]]");function uf(n,t,e){if(t.search(lf)>=0)throw Xn(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new Ta(...t.split("."))._internalPath}catch{throw Xn(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function Xn(n,t,e,s,i){const a=s&&!s.isEmpty(),u=i!==void 0;let h=`Function ${t}() called with invalid data`;e&&(h+=" (via `toFirestore()`)"),h+=". ";let p="";return(a||u)&&(p+=" (found",a&&(p+=` in field ${s}`),u&&(p+=` in document ${i}`),p+=")"),new D(S.INVALID_ARGUMENT,h+n+p)}function cf(n,t){return n.some((e=>e.isEqual(t)))}const fo="@firebase/firestore",po="4.15.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(t,e,s,i,a){this._firestore=t,this._userDataWriter=e,this._key=s,this._document=i,this._converter=a}get id(){return this._key.path.lastSegment()}get ref(){return new ht(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new hf(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(t){if(this._document){const e=this._document.data.field(_s("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class hf extends Pa{data(){return super.data()}}function ff(n,t,e){let s;return s=n?n.toFirestore(t):t,s}class Vn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class pe extends Pa{constructor(t,e,s,i,a,u){super(t,e,s,i,u),this._firestore=t,this._firestoreImpl=t,this.metadata=a}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new On(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const s=this._document.data.field(_s("DocumentSnapshot.get",t));if(s!==null)return this._userDataWriter.convertValue(s,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new D(S.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=pe._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}pe._jsonSchemaVersion="firestore/documentSnapshot/1.0",pe._jsonSchema={type:J("string",pe._jsonSchemaVersion),bundleSource:J("string","DocumentSnapshot"),bundleName:J("string"),bundle:J("string")};class On extends pe{data(t={}){return super.data(t)}}class ze{constructor(t,e,s,i){this._firestore=t,this._userDataWriter=e,this._snapshot=i,this.metadata=new Vn(i.hasPendingWrites,i.fromCache),this.query=s}get docs(){const t=[];return this.forEach((e=>t.push(e))),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach((s=>{t.call(e,new On(this._firestore,this._userDataWriter,s.key,s,new Vn(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new D(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=(function(i,a){if(i._snapshot.oldDocs.isEmpty()){let u=0;return i._snapshot.docChanges.map((h=>{const p=new On(i._firestore,i._userDataWriter,h.doc.key,h.doc,new Vn(i._snapshot.mutatedKeys.has(h.doc.key),i._snapshot.fromCache),i.query.converter);return h.doc,{type:"added",doc:p,oldIndex:-1,newIndex:u++}}))}{let u=i._snapshot.oldDocs;return i._snapshot.docChanges.filter((h=>a||h.type!==3)).map((h=>{const p=new On(i._firestore,i._userDataWriter,h.doc.key,h.doc,new Vn(i._snapshot.mutatedKeys.has(h.doc.key),i._snapshot.fromCache),i.query.converter);let g=-1,A=-1;return h.type!==0&&(g=u.indexOf(h.doc.key),u=u.delete(h.doc.key)),h.type!==1&&(u=u.add(h.doc),A=u.indexOf(h.doc.key)),{type:df(h.type),doc:p,oldIndex:g,newIndex:A}}))}})(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new D(S.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=ze._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Xr.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],s=[],i=[];return this.docs.forEach((a=>{a._document!==null&&(e.push(a._document),s.push(this._userDataWriter.convertObjectMap(a._document.data.value.mapValue.fields,"previous")),i.push(a.ref.path))})),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function df(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return k(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ze._jsonSchemaVersion="firestore/querySnapshot/1.0",ze._jsonSchema={type:J("string",ze._jsonSchemaVersion),bundleSource:J("string","QuerySnapshot"),bundleName:J("string"),bundle:J("string")};function yf(n,t,e){n=bi(n,ht);const s=bi(n.firestore,Ea),i=ff(n.converter,t),a=of(s);return pf(s,[af(a,"setDoc",n._key,i,n.converter!==null,e).toMutation(n._key,Nt.none())])}function pf(n,t){const e=tf(n);return Xh(e,t)}(function(t,e=!0){vu(cu),Mn(new kn("firestore",((s,{instanceIdentifier:i,options:a})=>{const u=s.getProvider("app").getImmediate(),h=new Ea(new wu(s.getProvider("auth-internal")),new Pu(u,s.getProvider("app-check-internal")),zu(u,i),u);return a={useFetchStreams:e,...a},h._setSettings(a),h}),"PUBLIC").setMultipleInstances(!0)),je(fo,po,t),je(fo,po,"esm2020")})();export{_f as d,yf as s};
