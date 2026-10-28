import {parse} from 'acorn';
import {parse as parseHTML} from 'parse5';

export function walk(node,visit,parents=[]){
 if(!node||typeof node!=='object')return;
 if(node.type)visit(node,parents);
 for(const [key,value] of Object.entries(node)){
  if(['loc','range','start','end'].includes(key))continue;
  if(Array.isArray(value))value.forEach(x=>walk(x,visit,[node,...parents]));else if(value&&typeof value==='object')walk(value,visit,[node,...parents]);
 }
}
export function editRanges(source,edits){
 return edits.sort((a,b)=>b.start-a.start).reduce((s,e)=>s.slice(0,e.start)+e.text+s.slice(e.end),source);
}
// Parse JavaScript, never replace operators, identifiers, URLs, or source comments.
export function rewriteJS(source,copy,onText=()=>{}){
 const tree=parse(source,{ecmaVersion:'latest',sourceType:'module',allowReturnOutsideFunction:true});
 const edits=[];
 walk(tree,(node,parents)=>{
  const property=parents[0],object=parents[1];
  if(property?.type==='Property'&&object?.type==='ObjectExpression'){
   const key=property.key.name??property.key.value;
   const props=Object.fromEntries(object.properties.filter(x=>x.type==='Property').map(x=>[x.key.name??x.key.value,x.value.value]));
   if(['text','body','message'].includes(key)&&(props.sender==='user'||props.role==='user'||('author' in props&&'score' in props)))return;
   if(['id','url','href','src','path','email','phone','password','token','requestToken','code'].includes(key))return;
  }
  if(node.type==='Literal'&&typeof node.value==='string'){
   const text=copy(node.value);onText(node.value,text);
   if(text!==node.value)edits.push({start:node.start,end:node.end,text:JSON.stringify(text)});
  }else if(node.type==='TemplateElement'&&node.value.cooked!==null){
   const text=copy(node.value.cooked);onText(node.value.cooked,text);
   if(text!==node.value.cooked)edits.push({start:node.start,end:node.end,text:text.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${')});
  }
 });
 const result=editRanges(source,edits);
 if(edits.length)parse(result,{ecmaVersion:'latest',sourceType:'module',allowReturnOutsideFunction:true});
 return result;
}
export function rewriteHTML(source,copy,onText=()=>{}){
 const root=parseHTML(source,{sourceCodeLocationInfo:true});const edits=[];
 function visit(node){
  const loc=node.sourceCodeLocation;
  if(node.nodeName==='#text'&&loc&&!['script','style'].includes(node.parentNode?.tagName)){
   const value=source.slice(loc.startOffset,loc.endOffset),text=copy(value);onText(value,text);
   if(text!==value)edits.push({start:loc.startOffset,end:loc.endOffset,text});
  }
  for(const attr of node.attrs||[]){
   if(!/[а-яё]/i.test(attr.value)||['src','href','action','style'].includes(attr.name))continue;
   const a=loc?.attrs?.[attr.name];if(!a)continue;
   const value=source.slice(a.startOffset,a.endOffset),text=copy(value);onText(value,text);
   if(text!==value)edits.push({start:a.startOffset,end:a.endOffset,text});
  }
  if(node.tagName==='script'&&!node.attrs?.some(a=>a.name==='src')&&loc?.endTag){
   const start=loc.startTag.endOffset,end=loc.endTag.startOffset,value=source.slice(start,end);
   const type=node.attrs?.find(a=>a.name==='type')?.value;
   if(!type||['module','text/javascript','application/javascript'].includes(type)){
    const text=rewriteJS(value,copy,onText);if(text!==value)edits.push({start,end,text});
   }
  }
  if(node.tagName==='style'&&loc?.endTag){
   const start=loc.startTag.endOffset,end=loc.endTag.startOffset,value=source.slice(start,end);
   const text=rewriteCSS(value,copy,onText);if(text!==value)edits.push({start,end,text});
  }
  (node.childNodes||[]).forEach(visit);if(node.content)visit(node.content);
 }
 visit(root);return editRanges(source,edits);
}
// Keep text-bearing selectors paired with their HTML/JS attributes. CSS values,
// class names, URLs, declarations and layout remain unchanged.
export function rewriteCSS(source,copy,onText=()=>{}){
 return source.replace(/(\[(?:aria-[\w-]+|data-[\w-]+)\s*[*^$|~]?=\s*)(["'])([^"'\n]*)(\2\s*\])/g,(all,prefix,quote,value,end)=>{
  const text=copy(value);onText(value,text);return prefix+quote+text+end;
 });
}
