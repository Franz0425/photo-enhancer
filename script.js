document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('imageInput').files[0];
  if (!file) {
    alert('Please select an image.');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result;

    // Step 1 — Start enhancement
    const start = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    const startData = await start.json();
    if (!startData.id) {
      alert('Error starting enhancement');
      return;
    }

    // Step 2 — Poll until done
    let result;
    while (true) {
      await new Promise(r => setTimeout(r, 3000)); // wait 3s between checks
      const poll = await fetch(`/api/check?id=${startData.id}`);
      result = await poll.json();

      if (result.status === 'succeeded' || result.status === 'failed') {
        break;
      }
    }

    if (result.status === 'succeeded') {
      document.getElementById('resultImage').src = result.output[0];
    } else {
      alert('Enhancement failed');
    }
  };

  reader.readAsDataURL(file);
});
