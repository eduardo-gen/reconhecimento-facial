import { env } from 'cloudflare:workers';
const bucket = () => { const b = (env as unknown as {BUCKET?: R2Bucket}).BUCKET; if (!b) throw new Error('Armazenamento JSON indisponÃ­vel.'); return b; };
function key(id: string) { if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('ID invÃ¡lido'); return `faces/${id}.json`; }
function sameOrigin(req: Request) { const o = req.headers.get('origin'); return !o || o === new URL(req.url).origin; }
export async function GET(req: Request) {
 try { const b = bucket(); const id = new URL(req.url).searchParams.get('id'); if (id) { const obj = await b.get(key(id)); return obj ? new Response(obj.body, {headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}) : Response.json({error:'AnÃ¡lise nÃ£o encontrada'},{status:404}); }
 const objects: R2Object[] = []; let cursor: string | undefined; do { const page = await b.list({prefix:'faces/',limit:1000,cursor}); objects.push(...page.objects); cursor = page.truncated ? page.cursor : undefined; } while (cursor); const latest = objects.sort((a,b)=>b.uploaded.getTime()-a.uploaded.getTime()).slice(0,100); const items = await Promise.all(latest.map(async obj => { const f = await b.get(obj.key); if (!f) return null; const data = await f.json<any>(); return {id:data.id,createdAt:data.createdAt,faceCount:data.faceCount,pointCount:data.pointCount,thumbnail:data.thumbnail}; })); return Response.json(items.filter(Boolean).sort((a,b)=>b!.createdAt.localeCompare(a!.createdAt)),{headers:{'Cache-Control':'no-store'}});
 } catch { return Response.json({error:'NÃ£o foi possÃ­vel consultar o banco JSON.'},{status:503}); }
}
export async function POST(req: Request) {
 if (!sameOrigin(req)) return Response.json({error:'Origem invÃ¡lida'},{status:403});
 try { const raw = await req.text(); if (raw.length > 1500000) return Response.json({error:'Captura muito grande'},{status:413}); const data = JSON.parse(raw); if (!Array.isArray(data.faces) || data.faces.length < 1 || data.faces.length > 3 || !data.faces.every((face:any)=>Array.isArray(face)&&face.length===478&&face.every((p:any)=>p&&['x','y','z'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k])))) || typeof data.thumbnail!=='string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data.thumbnail) || data.thumbnail.length>400000) return Response.json({error:'Dados faciais invÃ¡lidos'},{status:400});
 const record = {id:crypto.randomUUID(),createdAt:new Date().toISOString(),faceCount:data.faces.length,pointCount:data.faces[0].length,thumbnail:data.thumbnail,faces:data.faces}; await bucket().put(key(record.id),JSON.stringify(record),{httpMetadata:{contentType:'application/json'}}); return Response.json(record,{status:201});
 } catch { return Response.json({error:'NÃ£o foi possÃ­vel salvar a anÃ¡lise.'},{status:400}); }
}
export async function DELETE(req: Request) {
 if (!sameOrigin(req)) return Response.json({error:'Origem invÃ¡lida'},{status:403});
 try { const id = new URL(req.url).searchParams.get('id'); if (!id) return Response.json({error:'ID obrigatÃ³rio'},{status:400}); await bucket().delete(key(id)); return Response.json({ok:true}); } catch { return Response.json({error:'NÃ£o foi possÃ­vel excluir.'},{status:400}); }
}
