import dotenv from 'dotenv';
dotenv.config();
import { supabase, supabaseAdmin } from '../src/server/db';

async function checkStorage() {
  const client = supabaseAdmin || supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  console.log('Supabase URL:', url);
  
  const bucketNames = ['destinations', 'attractions', 'homestays', 'taxi-stands', 'common'];
  
  const { data: buckets, error: bError } = await client.storage.listBuckets();
  console.log('Buckets listed:', buckets?.map(b => ({ name: b.name, public: b.public })), 'Error:', bError);

  for (const bName of bucketNames) {
    try {
      const { data: files, error: fError } = await client.storage.from(bName).list('', { limit: 500 });
      if (fError) {
        console.error(`Error listing bucket ${bName}:`, fError);
        continue;
      }
      console.log(`\n=== Bucket: ${bName} (Total top-level: ${files?.length || 0}) ===`);
      if (files && files.length > 0) {
        for (const file of files) {
          if (!file.id) {
            // It's a folder, list contents
            const { data: subfiles } = await client.storage.from(bName).list(file.name, { limit: 100 });
            console.log(`  [Folder] ${file.name}/ (${subfiles?.length || 0} items):`, subfiles?.map(s => s.name).slice(0, 10));
          } else {
            console.log(`  [File] ${file.name} (${file.metadata?.size || 0} bytes)`);
          }
        }
      }
    } catch (err) {
      console.error(`Exception on bucket ${bName}:`, err);
    }
  }
}

checkStorage().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
