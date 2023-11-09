JS
Copy
const callAPI = async () => {
	try {
		const res = await fetch(`https://localhost:4444/characters/4`);
		const data = await res.json();
		console.log(data);
	} catch (err) {
		console.log(err);
	}
};