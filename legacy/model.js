const round=n=>Math.round(n*1000000)/1000000;
const fail=m=>{throw new Error(m)};
const text=(x,label)=>{if(typeof x!=='string'||!x.trim()||x.length>150)fail(label+' es obligatorio (máximo 150 caracteres).');return x.trim()};
const num=(x,label,min=0)=>{if(x===''||x===null||!Number.isFinite(Number(x))||Number(x)<min||Number(x)>1e9)fail(label+' no es válido.');return Number(x)};
const id=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
function initial(){return {products:[],ingredients:[],orders:[],movements:[]}}
function needs(order){const result={};for(const line of order.items)for(const r of line.recipe)result[r.ingredientId]=round((result[r.ingredientId]||0)+r.quantity*line.quantity);return result}
function reserved(s,except){const result={};for(const o of s.orders.filter(o=>o.status==='Confirmado'&&o.id!==except))for(const [k,v] of Object.entries(needs(o)))result[k]=round((result[k]||0)+v);return result}
function shopping(s,from='',to='9999'){const quantities={};for(const o of s.orders.filter(o=>['Pendiente','Confirmado'].includes(o.status)&&o.date>=from&&o.date<=to))for(const [k,v] of Object.entries(needs(o)))quantities[k]=round((quantities[k]||0)+v);const outside={};for(const o of s.orders.filter(o=>o.status==='Confirmado'&&(o.date<from||o.date>to)))for(const [k,v] of Object.entries(needs(o)))outside[k]=(outside[k]||0)+v;return s.ingredients.filter(i=>quantities[i.id]).map(i=>({...i,required:quantities[i.id],available:round(Math.max(0,i.stock-(outside[i.id]||0))),buy:round(Math.max(0,quantities[i.id]-Math.max(0,i.stock-(outside[i.id]||0))))}))}
function mutate(original,action,payload,role='owner'){
 const s=structuredClone(original),p=payload||{};
 if(role!=='owner'&&!['order','status'].includes(action))fail('Requiere permisos de dueño.');
 if(action==='product'){
  const name=text(p.name,'El nombre');if(s.products.some(x=>x.name.toLocaleLowerCase()===name.toLocaleLowerCase()&&x.id!==p.id))fail('Ya existe un producto con ese nombre.');
  if(!['Viandas','Postres','Eventos','Otros'].includes(p.category))fail('Categoría inválida.');
  const record={id:p.id||id(),name,category:text(p.category,'La categoría'),price:num(p.price,'El precio'),description:String(p.description||'').slice(0,500)};
  const old=s.products.find(x=>x.id===p.id);if(p.id&&!old)fail('Producto inexistente.');if(old)Object.assign(old,record);else s.products.push({...record,recipe:[]});
 } else if(action==='ingredient'){
  const name=text(p.name,'El nombre');if(s.ingredients.some(x=>x.name.toLowerCase()===name.toLowerCase()))fail('El insumo ya existe.');
  if(!['kg','L','unidad'].includes(p.unit))fail('Unidad inválida.');s.ingredients.push({id:id(),name,unit:p.unit,stock:num(p.stock,'El stock'),minimum:num(p.minimum,'El mínimo'),cost:num(p.cost,'El costo unitario')});
 } else if(action==='stock'){
  const i=s.ingredients.find(x=>x.id===p.id);if(!i)fail('Insumo inexistente.');const q=num(p.quantity,'La cantidad',0.000001);const delta=p.kind==='entrada'?q:p.kind==='salida'?-q:fail('Movimiento inválido.');if(i.stock+delta<(reserved(s)[i.id]||0))fail('No puedes retirar stock reservado para pedidos.');i.stock=round(i.stock+delta);s.movements.push({id:id(),date:new Date().toISOString(),ingredient:i.name,quantity:delta,unit:i.unit,note:text(p.note,'El motivo')});
 } else if(action==='recipe'){
  const product=s.products.find(x=>x.id===p.id);if(!product)fail('Producto inexistente.');if(!Array.isArray(p.recipe))fail('Receta inválida.');const seen=new Set();product.recipe=p.recipe.map(r=>{if(!s.ingredients.some(i=>i.id===r.ingredientId))fail('Primero debes registrar el insumo.');if(seen.has(r.ingredientId))fail('No repitas un ingrediente.');seen.add(r.ingredientId);return {ingredientId:r.ingredientId,quantity:num(r.quantity,'La cantidad',0.000001)}});
 } else if(action==='order'){
  const customer=text(p.customer,'El cliente');if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date)fail('La fecha no es válida.');if(!['WhatsApp','Instagram','Directo'].includes(p.channel))fail('Canal inválido.');if(!Array.isArray(p.items)||!p.items.length)fail('Agrega al menos un producto.');
  const items=p.items.map(l=>{const x=s.products.find(x=>x.id===l.productId);if(!x||!x.recipe.length)fail('Cada producto debe tener una receta definida.');const quantity=num(l.quantity,'La cantidad',1);if(!Number.isInteger(quantity))fail('La cantidad de productos debe ser entera.');return {productId:x.id,name:x.name,price:x.price,quantity,recipe:structuredClone(x.recipe)}});
  s.orders.push({id:id(),number:s.orders.length+1,customer,date:p.date,channel:p.channel,notes:String(p.notes||'').slice(0,500),items,status:'Pendiente',created:new Date().toISOString()});
 } else if(action==='status'){
  const o=s.orders.find(x=>x.id===p.id);if(!o)fail('Pedido inexistente.');const allowed={Pendiente:['Confirmado','Cancelado'],Confirmado:['Entregado','Cancelado']};if(!allowed[o.status]?.includes(p.status))fail('Cambio de estado no permitido.');
  if(p.status==='Confirmado'){const r=reserved(s,o.id);for(const [k,v] of Object.entries(needs(o))){const i=s.ingredients.find(i=>i.id===k);if(!i||round(i.stock-(r[k]||0))<v)fail('Stock insuficiente: '+(i?.name||'insumo')+'. Revisa la lista de compras.')}}
  if(p.status==='Entregado')for(const [k,v] of Object.entries(needs(o))){const i=s.ingredients.find(i=>i.id===k);if(!i||i.stock<v)fail('Stock insuficiente.');i.stock=round(i.stock-v);s.movements.push({id:id(),date:new Date().toISOString(),ingredient:i.name,quantity:-v,unit:i.unit,note:'Entrega de pedido #'+o.number})}o.status=p.status;
 } else if(action==='demo'){
  if(s.products.length||s.ingredients.length||s.orders.length)fail('Los ejemplos solo se cargan en una base vacía.');
  s.ingredients=[{id:'harina',name:'Harina de trigo',unit:'kg',stock:12,minimum:3,cost:5.5},{id:'chocolate',name:'Chocolate bitter',unit:'kg',stock:2,minimum:1,cost:32},{id:'azucar',name:'Azúcar rubia',unit:'kg',stock:8,minimum:2,cost:4.5},{id:'huevo',name:'Huevos',unit:'unidad',stock:48,minimum:12,cost:0.6},{id:'pollo',name:'Pechuga de pollo',unit:'kg',stock:5,minimum:2,cost:18},{id:'arroz',name:'Arroz',unit:'kg',stock:10,minimum:3,cost:4.8}];
  s.products=[{id:'torta',name:'Torta de chocolate',category:'Postres',price:65,description:'Torta casera, presentación de 8 porciones.',recipe:[{ingredientId:'harina',quantity:0.4},{ingredientId:'chocolate',quantity:0.5},{ingredientId:'azucar',quantity:0.3},{ingredientId:'huevo',quantity:4}]},{id:'vianda',name:'Pollo con arroz',category:'Viandas',price:16,description:'Una porción individual para el almuerzo.',recipe:[{ingredientId:'pollo',quantity:0.2},{ingredientId:'arroz',quantity:0.15}]}];
 } else fail('Acción desconocida.');return s;
}
