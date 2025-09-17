Booking Process - Manufacturer से Worker तक
Step 1: Manufacturer Cart Setup
1. Manufacturer categories browse करता है
2. Workers देखता है category wise
3. Cart में items add करता है (CartController)
   - Category select
   - Worker count
   - Duration type/value
   - Preferred date/time
Step 2: Booking Creation (Checkout)
BookingController::checkout()
1. Cart items validate करता है
2. Booking create करता है (status: 'pending')
3. Auto-assign workers होते हैं
4. BookingWorker records create होते हैं (status: 'assigned')
5. Cart clear हो जाता है
Step 3: Worker Gets Notification
Worker dashboard में:
1. Assigned bookings दिखते हैं
2. WorkerController::getBookings() से data आता है
3. Worker को booking details मिलते हैं
Step 4: Worker Response
Worker के पास options:
1. Accept → BookingController::updateStatus('confirmed')
2. Reject → Status change या cancel
Step 5: Work Day Process
Confirmed booking के बाद:
1. Worker QR generate करता है
   → BookingController::generateQrCode()
2. Manufacturer QR scan करता है (check-in)
   → BookingController::scanQrCode('checkin')
3. Booking status becomes 'in_progress'
4. Work complete होने पर checkout
   → BookingController::scanQrCode('checkout')
5. Hours calculate होते हैं
Step 6: Completion
1. Worker या Manufacturer status update करता है
   → BookingController::updateStatus('completed')
2. Payment process होता है
3. Rating system activate होता है
Status Flow:
pending → assigned → confirmed → in_progress → completed/cancelled
Key Controllers:

CartController: Cart management
BookingController: Main booking lifecycle
WorkerController: Worker dashboard & profile
QrController: QR generation/scanning
PaymentController: Payment processing
RatingController: Post-completion rating

API Endpoints Used:
POST /manufacturer/cart → Add to cart
POST /manufacturer/bookings/checkout → Create booking
GET /worker/bookings → Worker sees assignments
PUT /bookings/{id}/status → Status updates
POST /bookings/{id}/qr-code → QR generation
POST /manufacturer/qr/scan → QR scanning
यह complete flow manufacturer के cart से शुरू होकर worker के completed work तक जाता है।