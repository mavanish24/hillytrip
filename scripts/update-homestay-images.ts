import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ijyzcvzaosfimvrzgopb.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const IMAGES = [
  'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/homestays/Homestay%201.png',
  'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/homestays/Homestay%202.png',
  'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/homestays/Homestay%203.png',
  'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/homestays/Homestay%204.png'
];

async function run() {
  console.log('=== Step 1: Verifying 4 Supabase Storage URLs ===');
  for (let i = 0; i < IMAGES.length; i++) {
    const url = IMAGES[i];
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`[Storage OK] Homestay ${i + 1}.png -> HTTP ${res.status}, Type: ${res.headers.get('content-type')}, Size: ${res.headers.get('content-length')} bytes`);
    } catch (e: any) {
      console.error(`[Storage ERR] Homestay ${i + 1}.png ->`, e.message);
    }
  }

  console.log('\n=== Step 2: Checking public.homestays Access ===');
  const client = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, count, error } = await client
    .from('homestays')
    .select('homestay_id, image_url', { count: 'exact' })
    .order('homestay_id', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Database query error:', error.message);
    console.error('Hint from PostgreSQL:', error.hint);
    console.log('\n--> Required Action: In Supabase SQL Editor, run:');
    console.log('GRANT ALL ON TABLE public.homestays TO postgres, anon, authenticated, service_role;');
    return;
  }

  console.log(`Total homestays found: ${count}`);
  console.log('Sample before update:', data);

  console.log('\n=== Step 3: Fetching and Updating All Homestays in Batches ===');
  let offset = 0;
  const batchFetchSize = 1000;
  let allHomestays: { homestay_id: string }[] = [];

  while (true) {
    const { data: batch, error: fetchErr } = await client
      .from('homestays')
      .select('homestay_id')
      .order('homestay_id', { ascending: true })
      .range(offset, offset + batchFetchSize - 1);

    if (fetchErr) {
      console.error('Error fetching batch:', fetchErr);
      break;
    }
    if (!batch || batch.length === 0) break;
    allHomestays = allHomestays.concat(batch);
    offset += batchFetchSize;
    if (batch.length < batchFetchSize) break;
  }

  console.log(`Fetched ${allHomestays.length} homestay IDs for rotation update.`);

  let updatedCount = 0;
  const updateChunkSize = 100;
  for (let i = 0; i < allHomestays.length; i += updateChunkSize) {
    const chunk = allHomestays.slice(i, i + updateChunkSize);
    await Promise.all(
      chunk.map(async (h, idxInChunk) => {
        const globalIndex = i + idxInChunk;
        const imageUrl = IMAGES[globalIndex % 4];
        const { error: updateErr } = await client
          .from('homestays')
          .update({ image_url: imageUrl })
          .eq('homestay_id', h.homestay_id);

        if (updateErr) {
          console.error(`Error updating homestay_id ${h.homestay_id}:`, updateErr.message);
        } else {
          updatedCount++;
        }
      })
    );
    process.stdout.write(`Updated ${updatedCount}/${allHomestays.length} homestays...\r`);
  }

  console.log(`\n\n=== Step 4: Verification ===`);
  const { count: finalTotal, error: verErr1 } = await client
    .from('homestays')
    .select('*', { count: 'exact', head: true });

  const { count: nonNullTotal, error: verErr2 } = await client
    .from('homestays')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null);

  console.log(`1. Total Homestays: ${finalTotal} (Target: 3,131)`);
  console.log(`2. Homestays with image_url IS NOT NULL: ${nonNullTotal} (Target: 3,131)`);

  const counts: Record<string, number> = {};
  for (const img of IMAGES) {
    const { count: imgCount } = await client
      .from('homestays')
      .select('*', { count: 'exact', head: true })
      .eq('image_url', img);
    counts[img] = imgCount || 0;
    console.log(`   - ${img.split('/').pop()}: ${imgCount}`);
  }
}

run().catch(console.error);
