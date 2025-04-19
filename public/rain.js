document.addEventListener('DOMContentLoaded', function() {
    const digitalRain = document.getElementById('digitalRain');

    // Initialize
    createDigitalRain();

    // Create digital rain effect
    function createDigitalRain() {
        const container = document.getElementById('digitalRain');
        const width = window.innerWidth;
        // Calculate fewer columns to prevent overflow
        const numberOfRains = Math.floor(width / 50); // Increased spacing between columns
                
        for (let i = 0; i < numberOfRains; i++) {
            const rain = document.createElement('div');
            rain.className = 'digit-rain';
            // Make sure rain columns stay within viewport width
            rain.style.left = `${(i * 50) + (Math.random() * 10)}px`;
            rain.style.animationDuration = `${5 + Math.random() * 15}s`;
                    
            let content = '';
            // Fewer characters per column
            for (let j = 0; j < 5 + Math.random() * 15; j++) {
                content += Math.random() > 0.5 ? '1' : '0';
                content += '<br>';
            }
            rain.innerHTML = content;
                    
            container.appendChild(rain);
        }
                
        // Add more rain periodically
        setInterval(() => {
            const rain = document.createElement('div');
            rain.className = 'digit-rain';
            rain.style.left = `${Math.random() * width}px`;
            rain.style.animationDuration = `${5 + Math.random() * 15}s`;
                    
            let content = '';
            for (let j = 0; j < 10 + Math.random() * 20; j++) {
                content += Math.random() > 0.5 ? '1' : '0';
                content += '<br>';
            }
            rain.innerHTML = content;
                    
            container.appendChild(rain);
                    
            // Remove after animation completes
            setTimeout(() => {
                if (rain.parentNode) {
                    rain.parentNode.removeChild(rain);
                }
            }, parseFloat(rain.style.animationDuration) * 1000);
        }, 2000);
    }
});