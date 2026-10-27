import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='http://127.0.0.1:8787';
const log=createWriteStream(join(tmpdir(),'placebo-review-runtime.log'));
const server=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0','--var','COMMERCE_MODE:preview','--var','PRIVATE_ADMIN_ENABLED:true'],{cwd:root,stdio:['ignore','pipe','pipe']});server.stdout.pipe(log);server.stderr.pipe(log);
let passed=0;
class Shopper{cookie='';async req(path,body,headers={}){const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json',Origin:base}),...(this.cookie?{Cookie:this.cookie}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});for(const h of r.headers.getSetCookie()){const pair=h.split(';')[0];const name=pair.split('=')[0];this.cookie=this.cookie.split('; ').filter(x=>x&&!x.startsWith(name+'=')).concat(pair).join('; ');}const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return{status:r.status,data,headers:r.headers};}async api(action,data){return this.req('/api/commerce'+(data===undefined?'?action='+action:''),data===undefined?undefined:{...data,action});}}
const owner={'oai-authenticated-user-id':'qa-owner','oai-authenticated-user-email':'qa-owner@example.invalid'};
async function ok(name,fn){await fn();passed++;console.log('PASS '+name);}
const buyer=new Shopper(),other=new Shopper();
const address={first_name:'Test',last_name:'Customer',address_1:'Test street 10',address_2:'',city:'Valencia',postal_code:'46004',country_code:'es',phone:''};
try{
  await ok('page links preserve native browser navigation without intercepting clicks',async()=>{
    const require=createRequire(new URL('../package.json',import.meta.url));
    const ts=require('typescript');const exports={};
    const source=readFileSync(join(root,'components/site-link.tsx'),'utf8');
    const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    runInNewContext(compiled,{exports,require});
    const onClick=()=>{};
    for(const href of ['/shop','/products/daisy','/checkout','/admin','/policies/privacy']){
      const link=exports.default({href,children:'Open page'});assert.equal(link.type,'a');assert.equal(link.props.href,href);assert.equal(link.props.onClick,undefined);
      assert.equal(exports.default({href,onClick}).props.onClick,onClick);
    }
    for(const file of ['components/storefront.tsx','components/shop-provider.tsx','components/admin.tsx','components/checkout.tsx'])assert.doesNotMatch(readFileSync(join(root,file),'utf8'),/from ['"]next\/(link|navigation)['"]/,'Client navigation regression: '+file);
    assert.match(readFileSync(join(root,'components/checkout.tsx'),'utf8'),/window\.location\.assign\('\/orders\//);
  });
  for(let i=0;i<80;i++){try{const r=await fetch(base+'/favicon.svg');if(r.ok)break;}catch{}if(server.exitCode!==null)throw new Error('Review server exited.');await new Promise(r=>setTimeout(r,250));}
  let products;
  await ok('server-rendered pages, product images and local fonts',async()=>{for(const path of ['/','/shop','/products/daisy','/about','/teams','/contact','/checkout','/policies/terms','/images/hero.webp','/images/daisy.webp','/fonts/fraunces-latin-900-normal.woff2']){const r=await buyer.req(path);assert.equal(r.status,200,path);if(path==='/')assert.match(r.data,/For the people who care/);}const r=await buyer.api('catalog');assert.equal(r.status,200);products=r.data.products;assert.equal(products.filter(p=>p.status==='published').length,4);});
  await ok('every rendered internal navigation link resolves to an HTML page',async()=>{
    const queue=['/','/shop','/about','/teams','/contact','/checkout',...products.map(p=>'/products/'+p.slug)];
    const visited=new Set();
    while(queue.length){const path=queue.shift();if(visited.has(path))continue;visited.add(path);
      const r=await buyer.req(path,undefined,path==='/admin'?owner:{});
      assert.equal(r.status,200,path);assert.match(r.headers.get('content-type')||'',/text\/html/,path);
      if(path!=='/admin'){assert.match(r.data,/Buy for your team\./,path);assert.match(r.data,/href="\/teams"[^>]*>Explore team orders/,path);}
      if(path==='/teams'){for(const section of ['Same team.','The clinic set','The name game','Your own little mark','Plan your team order','Preferred date','Delivery country','Before you ask.'])assert(r.data.includes(section),'Missing team section: '+section);assert.match(r.data,/id="team-enquiry"/);assert.match(r.data,/id="team-consent"/);}
      assert.doesNotMatch(r.data,/data-nextjs-router=/,path);
      for(const match of r.data.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)){
        const href=match[1].replaceAll('&amp;','&');if(!href.startsWith('/')||href.startsWith('//'))continue;
        const url=new URL(href,base);if(!visited.has(url.pathname))queue.push(url.pathname);
      }
    }
    for(const path of ['/admin','/policies/shipping','/policies/returns','/policies/privacy','/policies/terms'])assert(visited.has(path),'Missing linked page: '+path);
    console.log('NAVIGATION_ROUTES_VERIFIED '+visited.size);
  });
  const variant=products[0].variants[0].id;
  await ok('server-backed basket survives repeated reads',async()=>{let r=await buyer.api('cart');assert.equal(r.status,200);assert.equal(r.data.cart.items.length,0);r=await buyer.api('add',{variantId:variant,quantity:2,personalization:'Dr. Test'});assert.equal(r.status,200);assert.equal(r.data.cart.subtotal,7000);const reloaded=await buyer.api('cart');assert.equal(reloaded.data.cart.id,r.data.cart.id);assert.equal(reloaded.data.cart.items[0].personalization,'Dr. Test');});
  await ok('discount, EU shipping and server-calculated total',async()=>{let r=await buyer.api('discount',{code:'FIRSTDOSE'});assert.equal(r.data.cart.discount,700);r=await buyer.api('country',{country:'fr'});assert.equal(r.data.cart.shipping,790);assert.equal(r.data.cart.total,7090);const bad=await buyer.api('country',{country:'us'});assert.equal(bad.status,400);await buyer.api('country',{country:'es'});});
  await ok('rejects malformed checkout and cross-origin writes',async()=>{const r=await buyer.api('checkout',{cartId:'fake',email:'invalid',address,accepted:false});assert.equal(r.status,400);const csrf=await buyer.req('/api/commerce',{action:'add',variantId:variant,quantity:1,personalization:''},{Origin:'https://example.invalid'});assert.equal(csrf.status,403);});
  let order;
  await ok('idempotent checkout and stock reservation',async()=>{const c=(await buyer.api('cart')).data.cart;const body={cartId:c.id,email:'customer@example.invalid',address,note:'Test only',accepted:true};const a=await buyer.api('checkout',body);assert.equal(a.status,200,JSON.stringify(a.data));const b=await buyer.api('checkout',body);assert.equal(b.status,200,JSON.stringify(b.data));order=a.data.order;assert.equal(b.data.order.id,order.id);assert.equal(order.total,6790);assert.equal(order.paymentStatus,'test');const updated=(await buyer.api('catalog')).data.products.find(p=>p.id===products[0].id);assert.equal(updated.variants.find(v=>v.id===variant).stock,18);});
  await ok('guest order privacy and protected admin',async()=>{const own=await buyer.req('/api/commerce?action=order&id='+order.id);assert.equal(own.status,200);const hidden=await other.req('/api/commerce?action=order&id='+order.id);assert.equal(hidden.status,404);const forbidden=await other.req('/api/admin');assert.equal(forbidden.status,401);const admin=await buyer.req('/api/admin',undefined,owner);assert.equal(admin.status,200,JSON.stringify(admin.data));assert(admin.data.orders.some(o=>o.id===order.id));});
  await ok('stock restored exactly once when order is cancelled',async()=>{const body={action:'order',data:{id:order.id,status:'cancelled',tracking:'',note:'Test cancellation'}};const a=await buyer.req('/api/admin',body,owner);assert.equal(a.status,200,JSON.stringify(a.data));const b=await buyer.req('/api/admin',body,owner);assert.equal(b.status,200);const p=b.data.products.find(p=>p.id===products[0].id);assert.equal(p.variants.find(v=>v.id===variant).stock,20);});
  await ok('product editing, content editing, newsletter and team inquiries persist',async()=>{const state=(await buyer.req('/api/admin',undefined,owner)).data;const p=structuredClone(state.products[0]);const title=p.title;p.title=title+' QA';let r=await buyer.req('/api/admin',{action:'product',data:p},owner);assert.equal(r.status,200,JSON.stringify(r.data));let catalog=(await buyer.api('catalog')).data.products;assert.equal(catalog.find(x=>x.id===p.id).title,title+' QA');p.title=title;await buyer.req('/api/admin',{action:'product',data:p},owner);const cfg={...state.config,heroCopy:'QA content persistence'};r=await buyer.req('/api/admin',{action:'settings',data:cfg},owner);assert.equal(r.status,200);assert.equal((await buyer.api('catalog')).data.config.heroCopy,'QA content persistence');await buyer.req('/api/admin',{action:'settings',data:state.config},owner);r=await buyer.api('subscribe',{email:'newsletter@example.invalid',consent:true});assert.equal(r.status,200);r=await buyer.api('inquiry',{name:'Test team',email:'team@example.invalid',team:'Test practice',quantity:10,message:'Testing team inquiry persistence.'});assert.equal(r.status,200);const updated=(await buyer.req('/api/admin',undefined,owner)).data;assert(updated.subscribers.some(s=>s.email==='newsletter@example.invalid'));assert(updated.inquiries.some(i=>i.email==='team@example.invalid'));});
  await ok('simultaneous buyers cannot oversell the last cap',async()=>{const state=(await buyer.req('/api/admin',undefined,owner)).data;const original=structuredClone(state.products.find(p=>p.id===products[0].id));const p=structuredClone(original);p.variants.find(v=>v.id===variant).stock=1;assert.equal((await buyer.req('/api/admin',{action:'product',data:p},owner)).status,200);const x=new Shopper(),y=new Shopper();await Promise.all([x.api('cart'),y.api('cart')]);for(const s of [x,y])assert.equal((await s.api('add',{variantId:variant,quantity:1,personalization:''})).status,200);const cx=(await x.api('cart')).data.cart,cy=(await y.api('cart')).data.cart;const results=await Promise.all([x.api('checkout',{cartId:cx.id,email:'race-a@example.invalid',address,accepted:true}),y.api('checkout',{cartId:cy.id,email:'race-b@example.invalid',address,accepted:true})]);assert.equal(results.filter(r=>r.status===200).length,1,JSON.stringify(results));assert(results.some(r=>r.status===400||r.status===409));const stock=(await buyer.api('catalog')).data.products.find(x=>x.id===p.id).variants.find(v=>v.id===variant).stock;assert.equal(stock,0);const placed=results.find(r=>r.status===200).data.order;await buyer.req('/api/admin',{action:'order',data:{id:placed.id,status:'cancelled',tracking:'',note:'Concurrency test'}},owner);await buyer.req('/api/admin',{action:'product',data:original},owner);});
  console.log('COMMERCE_REVIEW_PASSED '+passed);
}finally{server.kill('SIGTERM');log.end();}
