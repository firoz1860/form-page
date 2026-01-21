# Entries Manager (React)

A simple frontend React app to add, view, search, update, delete, and bulk-import entries (Name, Email, Phone). Data is saved in **localStorage** so it does not reset on refresh. Includes **Dark/Light theme** and **toast notifications**.

## Features
- Add entry with validation  
  - Name: letters only  
  - Email: valid format + auto-add `@gmail.com` if missing  
  - Phone: numeric  
- Max entries limit (configured in code)
- Table display (Name | Email | Phone)
- Show Entries page with **case-insensitive** search (starts-with)
- Update & Delete entries
- Dropdown bulk paste (multiple entries at once)
- Toast popup on Add / Update / Delete / Bulk Add
- Dark/Light theme toggle
- Notes
Data is stored only in frontend state + localStorage.
Clearing browser storage will remove saved entries.


## Tech Stack
- React (Functional Components)
- useState, useEffect
- CSS (no UI libraries)

## Setup & Run
```bash
npm install
npm run dev

Bulk Paste Format
Ayesha Khan, ayesha, 9876543210
Farhan Ali, farhanali, 9991112233
Arjun Mehta, arjun.mehta, 9123456789
Neha Sharma, neha.sharma, 9988776655
Rohit Verma, rohitverma, 9012345678
Priya Singh, priyasingh, 9090909090
Karan Patel, karan.patel, 9345678901
Sneha Iyer, sneha.iyer, 9567890123
Vivek Gupta, vivekgupta, 9789012345
Ananya Das, ananya.das, 8899001122
Sahil Jain, sahiljain, 8877665544
Ritika Roy, ritika.roy, 7766554433
Manish Kumar, manishkumar, 6655443322
Divya Nair, divya.nair, 5544332211
Amit Joshi, amitjoshi, 4433221100
Pooja Bansal, pooja.bansal, 9321098765
Nitin Malhotra, nitinmalhotra, 9191919191
Kavya Rao, kavyarao, 8080808080
Ishaan Kapoor, ishaankapoor, 7979797979
Meera Chawla, meerachawla, 6868686868
