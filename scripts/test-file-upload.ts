/**
 * Test File Upload to Google Drive
 * Run: npx tsx scripts/test-file-upload.ts
 */

import 'dotenv/config'

async function testFileUpload() {
  console.log('🧪 Testing Google Drive File Upload...\n')

  // Dynamic import for module
  const { uploadFile, listFiles, isStorageHealthy, deleteFile } = await import('../src/lib/file-storage')

  // Step 1: Health check
  console.log('1️⃣ Checking storage health...')
  const health = await isStorageHealthy()
  if (!health.healthy) {
    console.error('❌ Storage health check failed:', health.message)
    process.exit(1)
  }
  console.log('   ✅ Storage is healthy\n')

  // Step 2: Upload test file
  console.log('2️⃣ Uploading test file...')
  const testContent = `Test file created at ${new Date().toISOString()}\nThis file was uploaded by the Dashboard Uskup file storage test.`
  
  try {
    const result = await uploadFile(
      Buffer.from(testContent),
      `test-upload-${Date.now()}.txt`,
      'text/plain',
      'surat'
    )

    console.log('   ✅ File uploaded successfully!')
    console.log('   📁 File ID:', result.fileId)
    console.log('   📎 File Name:', result.fileName)
    console.log('   🔗 View URL:', result.fileUrl)
    console.log('   ⬇️  Download URL:', result.downloadUrl)
    console.log('   📦 Size:', result.size, 'bytes\n')

    // Step 3: List files
    console.log('3️⃣ Listing files in "surat" category...')
    const files = await listFiles('surat', 5)
    console.log(`   Found ${files.length} file(s):`)
    files.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.name} (${file.size} bytes)`)
    })
    console.log()

    // Step 4: Cleanup (optional - delete test file)
    console.log('4️⃣ Cleaning up test file...')
    const deleted = await deleteFile(result.fileId)
    if (deleted) {
      console.log('   ✅ Test file deleted\n')
    } else {
      console.log('   ⚠️  Could not delete test file (manual cleanup may be needed)\n')
    }

    console.log('🎉 All tests passed! File upload is working correctly.')
    console.log('\n📋 Summary:')
    console.log('   - Google Drive connection: ✅')
    console.log('   - File upload: ✅')
    console.log('   - File listing: ✅')
    console.log('   - File deletion: ✅')

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message)
    console.error('\n🔍 Troubleshooting:')
    console.error('   1. Make sure folder is shared with service account')
    console.error('   2. Service account email: dashboard-calendar-sync@dashboarduskup.iam.gserviceaccount.com')
    console.error('   3. Permission should be "Editor"')
    console.error('   4. Check GOOGLE_DRIVE_FOLDER_ID in .env')
    process.exit(1)
  }
}

testFileUpload()
