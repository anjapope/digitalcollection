import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const out=path.join(root,'outputs/archivory-editorial');
const data=JSON.parse(await fs.readFile(path.join(out,'source.json'),'utf8'));
const wb=Workbook.create();
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const numeric=new Set(['sort_order','sortKey','capacity','latitude','longitude']);
for(const name of [...Object.keys(data),'Guide']) wb.worksheets.add(name);
const widths={description:76,extendedExplanation:76,introduction:76,successText:76,notes:70,display_description:70,citation:66,source:60,title:38,editor_label:38,content_id:44,slot_id:48,placement_id:52,anchor_id:54,image:56,adapter:48,background_asset:58,route:45,displayedDate:38};
for(const [name,spec] of Object.entries(data)){
 const s=wb.worksheets.getItem(name),headers=[...spec.headers];
 if(name==='Placements')headers.push('Room (automatic)','Location (automatic)','Content title (automatic)');
 const count=spec.rows.length+15;
 const matrix=[headers,...spec.rows.map(r=>headers.map(h=>numeric.has(h)&&r[h]!==''&&r[h]!==undefined?Number(r[h]):r[h]??''))];
 s.getRangeByIndexes(0,0,matrix.length,headers.length).values=matrix;
 s.showGridLines=false;s.freezePanes.freezeRows(1);s.freezePanes.freezeColumns(1);
 s.getRangeByIndexes(0,0,count+1,headers.length).format={font:{name:'Arial',size:11,color:'#28313B'},verticalAlignment:'top',wrapText:true,rowHeight:32};
 headers.forEach((h,i)=>{const r=s.getRange(`${col(i)}1:${col(i)}${count+1}`);r.format.columnWidth=widths[h]??(h.includes('automatic')?40:28);if(numeric.has(h))r.setNumberFormat(['latitude','longitude'].includes(h)?'0.000000':'0');else r.setNumberFormat('@');});
 s.tables.add(`A1:${col(headers.length-1)}${count+1}`,true,name+'Table');
 s.getRange(`A1:${col(headers.length-1)}1`).format={fill:'#473E32',font:{bold:true,color:'#FFFFFF'},rowHeight:42,verticalAlignment:'center'};
 const reference=name==='Rooms'||name==='Slots';
 s.getRange(`A2:${col(headers.length-1)}${count+1}`).format.fill=reference?'#F0F1F2':'#FFF8E5';
 for(const h of ['adapter','anchor_id','background_asset','route']){const i=headers.indexOf(h);if(i>=0)s.getRange(`${col(i)}2:${col(i)}${count+1}`).format.fill='#E9ECEF';}
 spec.rows.forEach((r,i)=>{const lines=Math.max(...headers.map(h=>Math.ceil(String(r[h]??'').length/(widths[h]??28))));s.getRange(`A${i+2}:${col(headers.length-1)}${i+2}`).format.rowHeight=Math.max(34,lines*16+12);});
 for(const flag of ['enabled','published']){const i=headers.indexOf(flag);if(i>=0)s.getRange(`${col(i)}2:${col(i)}501`).dataValidation={rule:{type:'list',values:['true','false']}};}
 const typeCol=headers.indexOf(name==='Slots'?'slot_type':'content_type');
 if(typeCol>=0)s.getRange(`${col(typeCol)}2:${col(typeCol)}501`).dataValidation={rule:{type:'list',values:name==='Content'?['detail','tool','inline','collection']:['detail','tool','inline','collection','timeline']}};
 if(name==='Placements'){
  s.tabColor='#806238';
  s.getRange('B2:B501').dataValidation={rule:{type:'list',formula1:"'Slots'!$A$2:$A$501"}};
  s.getRange('C2:C501').dataValidation={rule:{type:'list',formula1:'INDIRECT(IF(D2="timeline","Timelines!$A$2:$A$501","Content!$A$2:$A$501"))'}};
  s.getRange(`G2:I${count+1}`).setNumberFormat('General');
  s.getRange(`G2:I${count+1}`).format.fill='#E9ECEF';
  for(let row=2;row<=count+1;row++)s.getRange(`G${row}:I${row}`).formulas=[[
   `=IF(B${row}="","",IFNA(VLOOKUP(B${row},Slots!$A$2:$D$501,2,FALSE),"Unknown slot"))`,
   `=IF(B${row}="","",IFNA(VLOOKUP(B${row},Slots!$A$2:$D$501,4,FALSE),"Unknown slot"))`,
   `=IF(C${row}="","Choose content",IF(D${row}="timeline",IFNA(VLOOKUP(C${row},Timelines!$A$2:$D$501,3,FALSE),"Unknown timeline"),IFNA(VLOOKUP(C${row},Content!$A$2:$B$501,2,FALSE),"Unknown content")))`]];
  s.getRange(`C2:C${count+1}`).conditionalFormats.addCustom('AND($A2<>"",$C2="")',{fill:'#FFE2A8'});
 } else if(name==='Content')s.tabColor='#AA895D';
 if(name==='Events')s.getRange('A2:A501').dataValidation={rule:{type:'list',formula1:"'Timelines'!$A$2:$A$501"}};
}
const guide=wb.worksheets.getItem('Guide');guide.showGridLines=false;guide.tabColor='#B5B5B5';
const instructions=[
 ['ArchIvory editorial workbook','Team editing copy of the current website data.'],
 ['1. Add material','Content: give each item a stable content_id. Fill title, description, image and citation. New ordinary items use detail and a blank adapter.'],
 ['2. Choose a location','Placements: select slot_id, then content_id. Room and location names appear automatically. Slots lists every prepared access point.'],
 ['3. Set presentation','content_type must match the item. Use sort_order to order items in a collection. Set published to true when ready.'],
 ['Empty locations','Pre-filled draft rows have no content and published=false. They do not create website records until you assign content.'],
 ['Same item in two rooms','Add a second placement with a new placement_id and the same content_id. Do not duplicate the material record.'],
 ['Timeline editing','Timelines contains introductions and success text. Events contains dated items. Equal sortKey values accept either order. displayedDate remains text.'],
 ['Existing collection','Collection is the original museum metadata. ChineseUVIvoryCollection draws its description from this sheet. Preserve its exact objectid.'],
 ['Existing adapters','Gray adapter fields preserve existing dialogs and tools. Their built-in text is still in room pages. Content text changes affect ordinary blank-adapter items; legacy dialog copy needs a separate migration.'],
 ['Prepared locations','Rooms and Slots describe existing artwork. Keep IDs, anchors, routes and assets stable. New physical locations require matching geometry.'],
 ['Images','Enter a website path such as /assets/img/example.jpg or an HTTPS image URL. Typing a local file path does not upload an image.'],
 ['Colors','Pale amber: editorial inputs. Gray: reference or calculated values. Dark amber: an empty content assignment.'],
 ['Preserve structure','Keep sheet names and the original header row. Add records in the tables. Never reuse an existing ID for a different record.'],
 ['Draft material','Existing teaching examples and placeholder notices are carried over unchanged. Your team supplies replacements.'],
 ['Import process','Run the check command described in README.md. Apply writes the website CSVs with a backup. Rebuild and inspect locally before any publishing.'],
 ['Sharing','Share this .xlsx in Excel or a shared drive. Return the edited .xlsx for validation and import. The site does not read the workbook live.'],
 ['Source snapshots','The hashes below prevent importing over source data changed after this workbook was created. Do not edit these cells.'],
 ...Object.values(data).map(spec=>[spec.file,spec.hash])];
guide.getRange(`A1:B${instructions.length}`).values=instructions;
guide.getRange(`A1:B${instructions.length}`).format={font:{name:'Arial',size:11,color:'#28313B'},wrapText:true,verticalAlignment:'center',rowHeight:58};
guide.getRange('A1:A30').format.columnWidth=35;guide.getRange('B1:B30').format.columnWidth=115;
guide.getRange('A1:B1').format.font={bold:true,size:15};
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Placements!A1:I5',include:'values,formulas',tableMaxRows:5,tableMaxCols:9,maxChars:2000})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:20},maxChars:1000})).ndjson);
// Verify the assignment helpers respond to a changed location, then restore it.
const placements=wb.worksheets.getItem('Placements');const old=placements.getRange('B2').values;
placements.getRange('B2').values=[['attic_trunk_01']];wb.recalculate();
if(placements.getRange('G2').values[0][0]!=='attic')throw Error('Placement helper did not update');
placements.getRange('B2').values=old;wb.recalculate();
await fs.mkdir(out,{recursive:true});
for(const name of [...Object.keys(data),'Guide']){
 const range=name==='Guide'?'A1:B9':name==='Placements'?'A1:D6':name==='Content'?'A1:D5':name==='Slots'?'A1:F6':name==='Events'?'A1:F5':name==='Timelines'?'A1:D5':name==='Rooms'?'A1:E5':'A1:F3';
 const preview=await wb.render({sheetName:name,range,scale:1,format:'png'});
 await fs.writeFile(path.join(out,`preview-${name}.png`),new Uint8Array(await preview.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(out,'ArchIvory Editorial Workbook.xlsx'));
console.log('Exported ArchIvory Editorial Workbook.xlsx');
