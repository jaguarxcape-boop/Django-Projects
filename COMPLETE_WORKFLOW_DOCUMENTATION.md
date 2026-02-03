# Complete Workflow: Adding and Editing Contestants with Images

## Overview
The contestant management system now includes complete functionality for adding new contestants and editing existing ones, with full image upload and preview capabilities.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  manage_event.jsx (Main Component)                         │
│  ├── State Management                                      │
│  │   ├── contestants: Array<Contestant>                   │
│  │   ├── editingContestantId: number | null              │
│  │   ├── showEditContestantModal: boolean                 │
│  │   ├── contestantPhoto: File | null                    │
│  │   └── photoPreview: DataURL | null                    │
│  │                                                        │
│  ├── Event Handlers                                       │
│  │   ├── handleAddContestant() → FormData → API          │
│  │   ├── handleEditContestant() → Opens Modal            │
│  │   ├── handlePhotoUpload() → Preview Image             │
│  │   └── closeEditContestantModal() → Reset State        │
│  │                                                        │
│  └── Components                                           │
│      ├── Quick Add Form (inline)                         │
│      ├── Contestant Grid (display cards)                 │
│      └── Edit Modal (full form with photo upload)        │
│                                                          │
│  manage_event.css (Styling)                             │
│  ├── .edit-modal (container)                            │
│  ├── .modal-header (title + close btn)                  │
│  ├── .photo-preview (image display area)                │
│  ├── .form-group (field containers)                     │
│  └── .modal-actions (button group)                      │
│                                                          │
│  apiCalls.js (API Communication)                        │
│  ├── AddContestant() - Accepts FormData                 │
│  └── UpdateContestant() - Accepts FormData              │
│                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↕↕↕ HTTP/FormData
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Django REST Framework)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EventContestantView (APIView)                             │
│  ├── POST /event/{id}/contestants/                        │
│  │   └── Receives: FormData(name, category_id, ...)      │
│  │   └── Saves: File to contestants_photos/              │
│  │   └── Returns: {contestant_data, photo_url}           │
│  │                                                        │
│  └── PATCH /event/{id}/contestants/{id}/                 │
│      └── Receives: FormData(updated_fields)              │
│      └── Saves: Updates all provided fields              │
│      └── Returns: {updated_contestant_data}              │
│                                                          │
│  EventCategoryContestant (Model)                         │
│  ├── id: Integer                                         │
│  ├── name: CharField(100)                               │
│  ├── bio: TextField(500)                                │
│  ├── hobby: CharField(500)                              │
│  ├── photo: ImageField('contestants_photos/')           │
│  └── category: ForeignKey(EventCategory)                │
│                                                         │
│  EventCategoryContestantSerializer                      │
│  └── Serializes all fields including photo URL         │
│                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↕↕↕ Database
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite/PostgreSQL)             │
├─────────────────────────────────────────────────────────────┤
│  event_eventcategorycontestant                             │
│  ├── id (PK)                                              │
│  ├── category_id (FK)                                    │
│  ├── name                                                │
│  ├── bio                                                 │
│  ├── hobby                                               │
│  └── photo (path: media/contestants_photos/...)         │
│                                                          │
│  Media File System                                      │
│  └── media/contestants_photos/{uuid}.{ext}             │
│                                                        │
└─────────────────────────────────────────────────────────────┘
```

## User Workflows

### Workflow 1: Adding a New Contestant with Photo

```
User Action                 Frontend State                API Call
─────────────────────────────────────────────────────────────────
                                                                    
Click "Add" form    ← Input: name="John"
                    ← Input: category_id="2"
                    ← Select file: photo.jpg
                                          ↓
handlePhotoUpload   ← Photo File Object saved
                    ← FileReader reads file
                    ← photoPreview = data:image/jpeg;base64,...
                                          ↓
Click "Add" btn     → handleAddContestant()
                    → Check: name & category filled ✓
                    → Create FormData:
                    →   .append('name', 'John')
                    →   .append('category_id', '2')
                    →   .append('bio', '')
                    →   .append('hobby', '')
                    →   .append('photo', File)
                                          ↓
                                   POST /event/1/contestants/
                                   Content-Type: multipart/form-data
                                          ↓
                                   Backend Processing:
                                   ├─ Save photo to disk
                                   ├─ Create DB record
                                   └─ Return response
                                          ↓
                    ← Response: {id: 5, name: 'John',
                                 category_id: 2,
                                 photo: '/media/contestants_photos/...',
                                 ...}
                                          ↓
Update State        → contestants.push(newContestant)
                    → Grid renders new card with photo
                    → Form cleared
                                          ↓
User sees           → New contestant card in grid with photo
                    → Success notification
```

### Workflow 2: Editing Contestant (Change Photo)

```
User Action                 Frontend State                API Call
─────────────────────────────────────────────────────────────────
                                                                    
Click "Edit" btn    → handleEditContestant(contestant)
                    → setContestant({
                    →   name: 'John',
                    →   category_id: 2,
                    →   bio: 'Bio text...',
                    →   hobby: 'Sports'
                    → })
                    → setEditingContestantId(5)
                    → setPhotoPreview('/media/contestants_photos/...')
                    → setShowEditContestantModal(true)
                                          ↓
Modal Opens         → Displays pre-filled form
                    → Shows existing photo in preview
                                          ↓
Upload new photo    → Select photo2.jpg
                    → handlePhotoUpload()
                    → contestantPhoto = File
                    → photoPreview = new data:image/jpeg;base64,...
                    → Modal updates preview in real-time
                                          ↓
Edit fields         → Change: name = 'Jonathan'
                    → contestant.name updated in state
                                          ↓
Click "Save         → handleAddContestant()
Changes"            → Detect editingContestantId = 5
                    → Create FormData:
                    →   .append('name', 'Jonathan')
                    →   .append('category_id', 2)
                    →   .append('bio', 'Bio text...')
                    →   .append('hobby', 'Sports')
                    →   .append('photo', File) ← NEW PHOTO
                                          ↓
                                   PATCH /event/1/contestants/5/
                                   Content-Type: multipart/form-data
                                          ↓
                                   Backend Processing:
                                   ├─ Delete old photo (optional)
                                   ├─ Save new photo to disk
                                   ├─ Update all fields in DB
                                   └─ Return updated record
                                          ↓
                    ← Response: {id: 5, name: 'Jonathan',
                                 category_id: 2,
                                 photo: '/media/contestants_photos/new...',
                                 ...}
                                          ↓
Update State        → contestants[5] = updatedContestant
                    → resetContestantForm()
                    → setShowEditContestantModal(false)
                                          ↓
Modal Closes        → Grid re-renders updated card
                    → Photo, name, all fields updated
                    → Success notification shown
                                          ↓
User sees           → Updated contestant card with new photo
```

### Workflow 3: Editing Contestant (Keep Photo)

```
User Action                 Frontend State                API Call
─────────────────────────────────────────────────────────────────
                                                                    
Click "Edit" btn    → Modal opens with pre-filled data
                    → photoPreview shows existing photo
                                          ↓
Modify bio only     → Change: contestant.bio = 'New bio'
                    → Don't select new photo
                    → contestantPhoto = null (unchanged)
                                          ↓
Click "Save         → handleAddContestant()
Changes"            → Create FormData:
                    →   .append('name', 'John')
                    →   .append('category_id', 2)
                    →   .append('bio', 'New bio')
                    →   .append('hobby', 'Sports')
                    →   (NO photo appended - null check)
                                          ↓
                                   PATCH /event/1/contestants/5/
                                   Content-Type: multipart/form-data
                                   (only 4 fields, no photo)
                                          ↓
                                   Backend Processing:
                                   ├─ Update name, category, bio, hobby
                                   ├─ Skip photo (not in request)
                                   ├─ Existing photo stays unchanged
                                   └─ Return updated record
                                          ↓
                    ← Response: {..., photo: (unchanged),
                                 bio: 'New bio', ...}
                                          ↓
Update State        → contestants[5] updated
                    → Modal closes
                                          ↓
User sees           → Bio updated
                    → Photo unchanged
                    → Success notification
```

## State Flow Diagram

```
Initial State
├── contestants: []
├── editingContestantId: null
├── showEditContestantModal: false
├── contestantPhoto: null
└── photoPreview: null

                    ↓

User clicks Edit Button
├── contestants: [...] (unchanged)
├── editingContestantId: 5 ← SET
├── showEditContestantModal: true ← SET
├── contestant: {name, category_id, bio, hobby} ← POPULATED
├── photoPreview: '/media/...' ← FROM EXISTING PHOTO
└── contestantPhoto: null ← RESET

                    ↓

User uploads photo
├── contestantPhoto: File ← SET TO NEW FILE
├── photoPreview: 'data:image/...' ← SET TO PREVIEW
└── Other state unchanged

                    ↓

User saves changes
├── API call with FormData ← INCLUDES NEW PHOTO
├── Response received ← INCLUDES UPDATED DATA
├── contestants[5] = response ← STATE UPDATED
├── editingContestantId: null ← RESET
├── showEditContestantModal: false ← RESET
├── contestantPhoto: null ← RESET
├── photoPreview: null ← RESET
└── contestant: {...} ← RESET

                    ↓

Modal Closes
└── Back to Initial State (after selecting different contestant)
```

## Data Transformation Pipeline

### Adding Contestant

```
User Input (UI Form)
    ↓
    ├─ name: "John Doe"
    ├─ category_id: 2
    ├─ bio: ""
    ├─ hobby: ""
    └─ photo: File { name: "photo.jpg", type: "image/jpeg", ... }
    ↓
FormData Construction
    ↓
    ├─ FormData.append('name', 'John Doe')
    ├─ FormData.append('category_id', '2')
    ├─ FormData.append('bio', '')
    ├─ FormData.append('hobby', '')
    └─ FormData.append('photo', File)
    ↓
HTTP POST Request
    ↓
    Content-Type: multipart/form-data; boundary=----...
    ─────────────────────────
    ------...
    Content-Disposition: form-data; name="name"
    
    John Doe
    ------...
    Content-Disposition: form-data; name="photo"; filename="photo.jpg"
    Content-Type: image/jpeg
    
    [Binary Image Data...]
    ------...
    ↓
Backend Processing
    ↓
    ├─ MultiPartParser parses request
    ├─ Extract: name, category_id, bio, hobby
    ├─ Extract: photo file
    ├─ Save file: media/contestants_photos/{uuid}.jpg
    ├─ Create DB record:
    │  ├─ name: 'John Doe'
    │  ├─ category_id: 2
    │  ├─ photo: 'contestants_photos/{uuid}.jpg'
    │  └─ (other fields)
    └─ Serialize response
    ↓
JSON Response
    ↓
{
  "status": "success",
  "data": {
    "id": 5,
    "name": "John Doe",
    "category_id": 2,
    "bio": "",
    "hobby": "",
    "photo": "/media/contestants_photos/{uuid}.jpg",
    "category": { "id": 2, "name": "Beauty" }
  }
}
    ↓
Frontend Update
    ↓
contestants.push({
  id: 5,
  name: "John Doe",
  category_id: 2,
  bio: "",
  hobby: "",
  photo: "/media/contestants_photos/{uuid}.jpg"
})
    ↓
UI Rendering
    ↓
Contestant Card appears in grid:
┌────────────────────┐
│ [Image: /media/... │
│                    │
│ John Doe           │
│ Beauty             │
│ [Edit] [Delete]    │
└────────────────────┘
```

## Form Validation Rules

```
Field                 Required    Rules
──────────────────────────────────────────────────
Name                  YES         ├─ Cannot be empty
                                  ├─ Max 100 chars
                                  └─ Trim whitespace

Category              YES         └─ Must be selected

Bio                   NO          ├─ Max 500 chars
                                  └─ Optional

Hobby                 NO          ├─ Max 500 chars
                                  └─ Optional

Photo                 NO          ├─ Optional
                                  ├─ Accept: image/*
                                  ├─ Max 5MB
                                  └─ Preview on upload
```

## API Contract

### POST /event/{event_id}/contestants/

**Request:**
```
Content-Type: multipart/form-data

Parameters:
├─ name: string (required)
├─ category_id: integer (required)
├─ bio: string (optional)
├─ hobby: string (optional)
└─ photo: file (optional, image/*)
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "name": "John Doe",
    "bio": "Description",
    "hobby": "Sports",
    "photo": "/media/contestants_photos/uuid.jpg",
    "category": 2
  }
}
```

### PATCH /event/{event_id}/contestants/{contestant_id}/

**Request:**
```
Content-Type: multipart/form-data

Parameters (any combination):
├─ name: string
├─ category_id: integer
├─ bio: string
├─ hobby: string
└─ photo: file (optional, image/*)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "name": "Updated Name",
    "bio": "Updated Bio",
    "hobby": "Updated Hobby",
    "photo": "/media/contestants_photos/new_uuid.jpg",
    "category": 2
  }
}
```

## Key Implementation Details

### FormData Handling
- Browser automatically sets `Content-Type: multipart/form-data`
- No need to manually set Content-Type header
- File objects properly encoded in multipart format
- Django MultiPartParser decodes automatically

### Photo Preview
- FileReader API reads file before upload
- Data URL created for preview display
- Original File object sent in FormData
- Backend saves actual file to disk

### State Management Pattern
- EditingContestantId flags update vs. create
- Form fields in separate `contestant` state object
- Photo handling separate (contestantPhoto, photoPreview)
- Modal state independent of form state

### Backward Compatibility
- API functions check if FormData or JSON
- Supports both file upload and no-photo cases
- Existing photo preserved if not provided in PATCH

## Performance Optimizations

1. **Local Preview**: FileReader processes image client-side (no upload)
2. **Lazy Rendering**: Modal only renders when showEditContestantModal=true
3. **GPU Acceleration**: CSS transforms for animations
4. **Selective Updates**: PATCH only sends modified fields
5. **Efficient State Updates**: Array.map() for targeted updates

## Security Measures

1. **Backend Validation**: Photo MIME type and size checked
2. **User Authentication**: IsAuthenticated required
3. **Ownership Verification**: User must own event
4. **CSRF Protection**: DRF standard CSRF tokens
5. **File Security**: Files saved outside web root with access control
