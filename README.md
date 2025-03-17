### **TrackDriver - Intelligent Trip Management System**
**TrackDriver** is a full-stack trip management system designed to help drivers efficiently plan their trips, track fuel stops, and generate **FMCSA-compliant daily logs**. The system utilizes **React (Frontend)** and **Django (Backend)**, integrating **Mapbox API** for real-time route visualization and automated trip calculations.

---

## **Features**
### **Frontend (React - `tripui/`)**
- **Modern UI with React Bootstrap Styling**  
- **Location Autocomplete**: Users can select current, pickup, and drop-off locations dynamically.  
- **Interactive Map with Mapbox**:
  - **Route visualization** on an interactive map.
  - **Fuel stop & rest stop markers** labeled with location names.
  - **Pickup & drop-off locations** clearly displayed.  
- **Real-time Trip Calculations**:
  - **Total Distance & Duration Calculation**.
  - **Automated Fuel & Rest Stop Calculation**.
  - **Generated Driving Logs** for each trip daily and multiple dailly log if .  

### **Backend (Django - `tripbackend/`)**
- **RESTful API built with Django Rest Framework (DRF)**.  
- **Trip Calculation Logic**:
  - Fetches route details from **Mapbox Directions API**.
  - Calculates **fuel stops**, **rest stops**, and **estimated trip time**.
  - **Reverse geocoding** to fetch real-world location names.  
- **ELD (Electronic Logging Device) Logs Generation**:
  - Daily logs with **driving hours, on-duty hours, off-duty hours, and sleeper hours**.  
- **Database Storage (PostgreSQL Recommended)**.
- **Environment Variables for Secure API Keys**.

---

## **Technology Stack**
| **Technology**   | **Usage** |
|-----------------|----------|
| **React.js**    | Frontend (tripui/) |
| **React-Bootstrap** | UI Components |
| **Mapbox API**  | Route Visualization |
| **Django**      | Backend Framework |
| **Django Rest Framework (DRF)** | API Development |
| **PostgreSQL**  | Database (Recommended) |
| **Axios**       | API Requests |

---
### **How the Trip Logging Application Works (Real-Life Example)**  

Let's say **John**, a truck driver, is hired to **transport goods** from **Houston, Texas**, to **New York City**. He needs to follow FMCSA (Federal Motor Carrier Safety Administration) rules, track his journey, log fuel stops, and rest stops.

---

### **Step-by-Step Process in the App**
### **1️⃣ John Enters Trip Details**
John opens the application and **fills out the trip form** with:  
- **Current Location:** Houston, TX  
- **Pickup Location:** Chicago, IL  
- **Dropoff Location:** New York, NY  
- **Current Cycle Used (Hours):** 5 hours already used  

 **He clicks "Submit Trip"**, and the backend processes his trip.

---

### **2️⃣ App Calculates the Route**
Once John submits, the system **fetches the best driving route** using **Mapbox API**.  

It calculates:  
✅ **Total Distance:** 1,874 miles  
✅ **Estimated Driving Time:** 32.07 hours  
✅ **Fuel Stops Required:** 1 (Refuel every 1,000 miles)  
✅ **Rest Stops Required:** 4 (Must rest after 8 hours of driving)  

---

### **3️⃣ App Logs the Trip & Generates Daily Log Sheets**
John’s trip will take multiple days, so the system **creates a log for each driving day**.

Example of logs:
| **Date**     | **Driving Hours** | **On Duty Hours** | **Off Duty Hours** | **Sleeper Hours** |
|-------------|------------------|------------------|------------------|------------------|
| 2025-03-16 | 11 hours         | 14 hours        | 10 hours        | 0 hours        |
| 2025-03-17 | 11 hours         | 14 hours        | 10 hours        | 0 hours        |
| 2025-03-18 | 10.07 hours      | 13.07 hours     | 10 hours        | 0 hours        |

✅ **On each day**, John’s driving, rest, and duty hours are tracked automatically based on FMCSA rules.

---

### **4️⃣ Displaying the Route on the Map**
Once the trip is created, **the map displays**:
- **Start Location** (Houston, TX)   
- **Pickup Point** (Chicago, IL)   
- **Dropoff Point** (New York, NY)   
- **Fuel Stops** (e.g., Indianapolis, IN)   
- **Rest Stops** (e.g., Columbus, OH)   

**John can now visually see his full trip route with all required stops!**

---

### **5️⃣ Checking Past Trips & Logs**
Later, John wants to review his previous trips. He can:
✅ **View all past trips** (`GET /api/trips/`)  
✅ **Check a specific trip’s details & logs** (`GET /api/trips/{id}/`)  

If John selects a trip, he sees:
- **Trip distance, estimated time, and stop locations**  
- **All logs for each driving day**  
- **A full route map with all stops**

---

### **Real-Life Benefits**
🔹 **John follows FMCSA rules automatically** (No manual logbook needed).  
🔹 **Rest & fuel stops are optimized for efficiency.**  
🔹 **The company can track past trips & driver logs.**  
🔹 **Less risk of violations due to incorrect logging.**

---
## **How To Install This App: Installation Guide**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/DASUCCESS/TrackDrivers.git
cd trackdriver
```

---

### **2️⃣ Backend Setup (`tripbackend/`)**
#### **Install Dependencies**
```sh
cd tripbackend
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```
#### **Set Up `.env` File**
Create a `.env` file in `tripbackend/`:
```
MAPBOX_API_KEY=your_mapbox_api_key
DJANGO_SECRET_KEY=your_secret_key
DB_NAME=db_name
DB_USER=db_username
DB_PASSWORD=db_password
DB_HOST=localhost
DB_PORT=5432
```

#### **Run Migrations & Start Server**
```sh
python manage.py migrate
python manage.py runserver
```
Backend will be live at **`http://127.0.0.1:8000/`**.

---

### **3️⃣ Frontend Setup (`tripui/`)**
#### **Install Dependencies**
```sh
cd ../tripui
npm install
```
#### **Set Up Environment Variables**
Create a `.env` file in `tripui/`:
```
REACT_APP_MAPBOX_API_KEY=your_mapbox_api_key
REACT_APP_API_BASE_URL=your_app-base_url
```

#### **Start Frontend**
```sh
npm start
```
Frontend will be live at **`http://localhost:3000/`**.

---

## **Usage Guide**
1️⃣ **Enter trip details** (Current Location, Pickup, Drop-off, Cycle Hours).  
2️⃣ **Submit trip**, and the system will calculate:
   - Route details (distance, time).
   - Fuel stops & rest stops.
   - ELD daily logs.  
3️⃣ **View results** on an interactive map, including:
   - Fuel & rest stop markers.
   - Pickup & drop-off points.
4️⃣ **Daily log sheets** are generated based on trip duration.

---

## **API Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/create-trip/` | Create a trip, calculate stops & logs |
| **GET** | `/api/trips/` | Retrieve all trips |
| **GET** | `/api/trips/{id}/` | Retrieve a specific trip with log details |

---

## **License**
This project is **open-source** and available under the **MIT License**.

---

### **Built With ❤️ by [Bolaji M. Luqman]**
Let me know if you need any edits! 🔥
