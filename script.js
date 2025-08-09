document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const imageUrl = document.getElementById('imageUrl').value.trim();
    if (!imageUrl) {
        alert('Please enter an image URL');
        return;
    }

    try {
        const res = await fetch('/api/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageUrl })
        });

        if (!res.ok) {
            throw new Error('API request failed');
        }

        const data = await res.json();
        console.log(data);
        alert('Enhancement request sent. Check console for details.');
    } catch (error) {
        alert('Failed to connect to API ❌');
        console.error(error);
    }
});
