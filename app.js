// جلب التبرعات من السيرفر
document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch('/items'); // استعلام الخادم لجلب العناصر المتاحة
        const donations = await response.json();
        
        const donationsGrid = document.getElementById('donations-grid');
        donations.forEach(donation => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');

            const itemImg = document.createElement('img');
            const imageUrl = donation.Image ? `http://localhost:5000${donation.Image}` : '/uploads/default-image.jpg'; // التحقق من مسار الصورة
            itemImg.src = imageUrl;
            itemImg.alt = 'صورة العنصر';

            const itemTitle = document.createElement('h3');
            itemTitle.textContent = donation.ItemName;

            const itemDescription = document.createElement('p');
            itemDescription.textContent = donation.Description;

            const donateBtn = document.createElement('button');
            donateBtn.classList.add('donate-btn');
            donateBtn.textContent = 'تبرع';

            itemCard.appendChild(itemImg);
            itemCard.appendChild(itemTitle);
            itemCard.appendChild(itemDescription);
            itemCard.appendChild(donateBtn);

            donationsGrid.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
    }
});



document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:5000/api/volunteers')  // تأكد من أن URL صحيح
        .then(response => response.json())
        .then(data => {
            const volunteersList = document.getElementById('volunteers-list');
            volunteersList.innerHTML = ''; // إعادة تعيين المحتوى قبل إضافة المتطوعين
            data.forEach(volunteer => {
                const volunteerElement = document.createElement('div');
                volunteerElement.classList.add('volunteer-item');
                volunteerElement.innerHTML = `
                    <img src="/uploads/volunteers/${volunteer.photo}" alt="صورة المتطوع" width="100">
                    <h3>${volunteer.Name}</h3>
                    <p>المهارات: ${volunteer.Skills}</p>
                    <p>معلومات الاتصال: ${volunteer.ContactInfo}</p>
                    <p>المدينة: ${volunteer.City}</p>
                    <p>الولاية: ${volunteer.State}</p>
                `;
                volunteersList.appendChild(volunteerElement);
            });
        })
        .catch(error => {
            console.error('Error fetching volunteers:', error);
        });
});
