# Document Upload Feature Testing Guide

## Overview
This document describes the baby attendance and document upload functionality implemented for the participant self-registration system.

## Features Implemented

### 1. Baby Attendance Question
- Radio button group with "Yes" and "No" options
- Located in the registration form after FCP Information section
- Conditionally shows/hides document upload fields based on selection

### 2. Document Upload Component
- Custom FileUpload component (`src/components/ui/file-upload.tsx`)
- Features:
  - Drag and drop support
  - Click to upload
  - File validation (type and size)
  - Visual feedback for selected files
  - Remove file functionality
  - Error display

### 3. File Validation
- **Allowed file types**: PDF, JPG, JPEG, PNG
- **Maximum file size**: 5MB per file
- **Required documents** (when attending with baby):
  - Nanny Approval Form
  - Waiver of Liability Form

### 4. Supabase Storage Integration
- Document Upload Service (`src/lib/documentUploadService.ts`)
- Secure file storage in Supabase Storage bucket
- Automatic bucket creation if not exists
- Unique file naming with timestamps
- File path tracking for database storage

## Manual Testing Checklist

### Test Case 1: Baby Attendance - No
1. Open registration form
2. Select "No" for baby attendance question
3. ✓ Verify document upload fields are NOT shown
4. ✓ Verify form can be submitted without documents

### Test Case 2: Baby Attendance - Yes (No Documents)
1. Open registration form
2. Select "Yes" for baby attendance question
3. ✓ Verify document upload fields ARE shown
4. ✓ Verify alert message about required documents is displayed
5. Try to submit form without uploading documents
6. ✓ Verify validation errors appear for both documents

### Test Case 3: File Upload - Valid Files
1. Select "Yes" for baby attendance
2. Upload a valid PDF file (< 5MB) for nanny approval
3. ✓ Verify file is accepted and displayed
4. ✓ Verify file name and size are shown
5. Upload a valid JPG file (< 5MB) for waiver
6. ✓ Verify file is accepted and displayed

### Test Case 4: File Upload - Invalid File Size
1. Select "Yes" for baby attendance
2. Try to upload a file larger than 5MB
3. ✓ Verify error message: "File size must be less than 5MB"
4. ✓ Verify file is not accepted

### Test Case 5: File Upload - Invalid File Type
1. Select "Yes" for baby attendance
2. Try to upload a .doc or .txt file
3. ✓ Verify error message about unsupported file type
4. ✓ Verify file is not accepted

### Test Case 6: File Upload - Remove File
1. Select "Yes" for baby attendance
2. Upload a valid file
3. Click the remove (X) button
4. ✓ Verify file is removed
5. ✓ Verify upload area is shown again

### Test Case 7: File Upload - Drag and Drop
1. Select "Yes" for baby attendance
2. Drag a valid file over the upload area
3. ✓ Verify visual feedback (border color change)
4. Drop the file
5. ✓ Verify file is accepted and displayed

### Test Case 8: Switch from Yes to No
1. Select "Yes" for baby attendance
2. Upload both required documents
3. Switch to "No" for baby attendance
4. ✓ Verify document upload fields are hidden
5. ✓ Verify uploaded files are cleared
6. Switch back to "Yes"
7. ✓ Verify upload fields are empty (files not retained)

### Test Case 9: Form Submission with Documents
1. Fill out all required form fields
2. Select "Yes" for baby attendance
3. Upload both required documents
4. Submit the form
5. ✓ Verify "Uploading Documents..." loading state appears
6. ✓ Verify documents are uploaded to Supabase Storage
7. ✓ Verify file paths are included in form data
8. ✓ Verify success message appears

### Test Case 10: Mobile Responsiveness
1. Open registration form on mobile device or resize browser
2. ✓ Verify baby attendance radio buttons are readable
3. ✓ Verify file upload areas are properly sized
4. ✓ Verify uploaded file information is displayed correctly
5. ✓ Verify drag and drop works on touch devices

## File Validation Rules

### Accepted File Types
- **PDF**: `.pdf` (application/pdf)
- **JPEG**: `.jpg`, `.jpeg` (image/jpeg)
- **PNG**: `.png` (image/png)

### File Size Limits
- Maximum: 5MB (5,242,880 bytes)
- Files exceeding this limit will be rejected with an error message

### Required Documents (when attending with baby)
1. **Nanny Approval Form**: Required
2. **Waiver of Liability Form**: Required

## Supabase Storage Configuration

### Bucket Name
`registration-documents`

### Bucket Settings
- **Public**: No (private bucket for security)
- **File Size Limit**: 5MB
- **Auto-creation**: Yes (bucket is created automatically if it doesn't exist)

### File Path Structure
```
registration-documents/
  └── {registrationId}/
      ├── nanny_approval_{timestamp}.{extension}
      └── waiver_liability_{timestamp}.{extension}
```

## Error Handling

### Client-Side Validation Errors
- File size too large
- Invalid file type
- Missing required documents

### Upload Errors
- Network failure
- Storage quota exceeded
- Permission denied
- Invalid file content

### User Feedback
- Real-time validation errors
- Loading states during upload
- Success confirmation
- Clear error messages

## Security Considerations

1. **File Type Validation**: Both MIME type and file extension are checked
2. **File Size Limits**: Enforced to prevent abuse
3. **Private Storage**: Documents are stored in a private bucket
4. **Unique File Names**: Timestamps prevent file name collisions
5. **Secure Tokens**: Registration IDs are used for file organization

## Future Enhancements

1. **Malware Scanning**: Add virus scanning for uploaded files
2. **Image Compression**: Automatically compress large images
3. **PDF Preview**: Show preview of uploaded PDF documents
4. **Progress Indicators**: Show upload progress percentage
5. **Retry Logic**: Automatic retry for failed uploads
6. **File Encryption**: Encrypt files at rest
