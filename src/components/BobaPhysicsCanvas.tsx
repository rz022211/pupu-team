import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CustomBobaDrink, Topping } from '../types/boba';
import { bobaAudio } from '../utils/audio';
import { Sparkles, Utensils, RotateCcw } from 'lucide-react';

interface BobaPhysicsCanvasProps {
  drink: CustomBobaDrink;
  onDrinkChange: (updated: Partial<CustomBobaDrink>) => void;
  onAddCart?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  borderColor: string;
  type: string;
  rotation: number;
  vRot: number;
  inStraw?: boolean;
  strawProgress?: number;
}

interface IceCube {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  bobOffset: number;
}

export const BobaPhysicsCanvas: React.FC<BobaPhysicsCanvasProps> = ({
  drink,
  onDrinkChange,
  onAddCart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isSipping, setIsSipping] = useState(false);
  const [strawInserted, setStrawInserted] = useState(true);
  const [strawXRatio, setStrawXRatio] = useState(0.55); // straw horizontal position
  const [strawSealedPop, setStrawSealedPop] = useState(false);
  const [sipEffectText, setSipEffectText] = useState<string | null>(null);

  // Cup visual bounds in virtual canvas coordinates (width: 360, height: 480)
  const cupWidthTop = drink.size === 'large' ? 240 : 210;
  const cupWidthBottom = drink.size === 'large' ? 170 : 155;
  const cupTopY = drink.size === 'large' ? 70 : 100;
  const cupBottomY = 440;
  const cupHeight = cupBottomY - cupTopY;

  // Ice count based on ice level
  const iceCount =
    drink.ice === 'warm' ? 0 : drink.ice === 'no-ice' ? 0 : drink.ice === 'light' ? 3 : drink.ice === 'regular' ? 5 : 7;

  // Initialize ice cubes
  const iceCubesRef = useRef<IceCube[]>([]);
  useEffect(() => {
    const cubes: IceCube[] = [];
    for (let i = 0; i < iceCount; i++) {
      cubes.push({
        id: i,
        x: 180 + (i - iceCount / 2) * 26 + (Math.random() * 8 - 4),
        y: cupTopY + 38 + (i % 2) * 14,
        size: 26,
        angle: (Math.random() - 0.5) * 0.4,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }
    iceCubesRef.current = cubes;
  }, [iceCount, cupTopY]);

  // Generate particles based on toppings
  const syncParticlesWithToppings = useCallback(
    (toppings: Topping[]) => {
      const newParticles: Particle[] = [];
      let idCounter = 1;

      toppings.forEach((top) => {
        let count = 0;
        if (top.type === 'pearl') count = 28;
        else if (top.type === 'popping') count = 18;
        else if (top.type === 'jelly') count = 14;
        else if (top.type === 'pudding') count = 6;
        else if (top.type === 'foam') count = 0; // rendered as top layer

        for (let i = 0; i < count; i++) {
          const spreadX = (Math.random() - 0.5) * (cupWidthBottom - 40);
          newParticles.push({
            id: idCounter++,
            x: 180 + spreadX,
            y: cupBottomY - 15 - Math.random() * 80,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2,
            radius: top.size * 0.5,
            color: top.color,
            borderColor: top.borderColor || 'rgba(0,0,0,0.15)',
            type: top.type,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.05,
          });
        }
      });

      particlesRef.current = newParticles;
    },
    [cupBottomY, cupWidthBottom]
  );

  // Sync particles when toppings change
  useEffect(() => {
    syncParticlesWithToppings(drink.toppings);
    bobaAudio.playBobaDrop();
  }, [drink.toppings, syncParticlesWithToppings]);

  // Main canvas render & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, 360, 480);

      // Cup polygon coordinates
      const halfTop = cupWidthTop / 2;
      const halfBottom = cupWidthBottom / 2;
      const cx = 180;

      const pTopLeft = { x: cx - halfTop, y: cupTopY };
      const pTopRight = { x: cx + halfTop, y: cupTopY };
      const pBottomRight = { x: cx + halfBottom, y: cupBottomY };
      const pBottomLeft = { x: cx - halfBottom, y: cupBottomY };

      // Draw subtle shadow below cup
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cupBottomY + 12, halfBottom + 16, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40, 25, 15, 0.07)';
      ctx.filter = 'blur(6px)';
      ctx.fill();
      ctx.restore();

      // Clip inside the cup for all liquids, drops, and toppings
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pTopLeft.x, pTopLeft.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.quadraticCurveTo(pBottomRight.x + 8, cupBottomY, pBottomRight.x, cupBottomY);
      ctx.arcTo(pBottomRight.x, cupBottomY, pBottomLeft.x, cupBottomY, 16);
      ctx.lineTo(pBottomLeft.x + 12, cupBottomY);
      ctx.arcTo(pBottomLeft.x, cupBottomY, pTopLeft.x, pTopLeft.y, 16);
      ctx.closePath();
      ctx.clip();

      // 1. Draw Liquid Base
      // Calculate liquid fill line
      const liquidTopY = cupTopY + 28;
      const liquidHeight = cupBottomY - liquidTopY;

      // Gradient for tea & milk fusion
      const liquidGrad = ctx.createLinearGradient(0, liquidTopY, 0, cupBottomY);
      const teaCol = drink.teaBase.color;
      const teaCol2 = drink.teaBase.secondaryColor || teaCol;
      const milkCol = drink.milk.color;
      const hasMilk = drink.milk.id !== 'pure-straight';

      if (hasMilk) {
        // Swirling milk tea gradient
        liquidGrad.addColorStop(0, milkCol);
        liquidGrad.addColorStop(0.35, milkCol);
        liquidGrad.addColorStop(0.65, teaCol2);
        liquidGrad.addColorStop(1, teaCol);
      } else {
        liquidGrad.addColorStop(0, teaCol2);
        liquidGrad.addColorStop(1, teaCol);
      }

      ctx.fillStyle = liquidGrad;
      ctx.fillRect(0, liquidTopY, 360, liquidHeight);

      // Subtle waving liquid surface
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, liquidTopY);
      for (let x = 0; x <= 360; x += 10) {
        const wave = Math.sin(time * 2 + x * 0.03) * 2.5;
        ctx.lineTo(x, liquidTopY + wave);
      }
      ctx.lineTo(360, cupBottomY);
      ctx.lineTo(0, cupBottomY);
      ctx.closePath();
      ctx.fillStyle = liquidGrad;
      ctx.fill();
      ctx.restore();

      // 2. Brown sugar tiger streaks (if chosen)
      if (drink.syrupDrizzle === 'brown-sugar' || drink.syrupDrizzle === 'strawberry') {
        const drizzleColor =
          drink.syrupDrizzle === 'brown-sugar'
            ? 'rgba(42, 22, 10, 0.72)'
            : 'rgba(180, 30, 60, 0.65)';

        ctx.save();
        ctx.strokeStyle = drizzleColor;
        ctx.lineCap = 'round';

        // 5 artistic syrup drips
        const dripOffsets = [-60, -32, -6, 25, 55];
        dripOffsets.forEach((ox, idx) => {
          ctx.lineWidth = 10 + (idx % 3) * 3;
          ctx.beginPath();
          const startX = cx + ox;
          const startY = liquidTopY + 12;
          const endY = cupBottomY - 20 - (idx % 2) * 50;

          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            startX + Math.sin(idx + time * 0.2) * 12,
            startY + 60,
            startX - Math.cos(idx) * 10,
            startY + 140,
            startX + (idx % 2 === 0 ? 8 : -8),
            endY
          );
          ctx.stroke();
        });
        ctx.restore();
      }

      // 3. Cheese Foam / Cloud Layer at the top (if present)
      const hasFoam = drink.toppings.some((t) => t.type === 'foam');
      if (hasFoam) {
        const foamGrad = ctx.createLinearGradient(0, liquidTopY, 0, liquidTopY + 45);
        foamGrad.addColorStop(0, '#FFFFFF');
        foamGrad.addColorStop(1, 'rgba(255, 250, 240, 0.88)');

        ctx.fillStyle = foamGrad;
        ctx.fillRect(0, liquidTopY, 360, 42);

        // Gentle bubbly foam edge
        ctx.beginPath();
        for (let x = 0; x <= 360; x += 15) {
          ctx.arc(x, liquidTopY + 42, 6, 0, Math.PI);
        }
        ctx.fillStyle = 'rgba(255, 250, 240, 0.9)';
        ctx.fill();
      }

      // 4. Update and Render Particles (Boba Pearls, Jellies, Custards)
      const particles = particlesRef.current;
      const damping = 0.65;
      const gravity = 0.35;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Normal gravity & bounds physics
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Bottom boundary collision
        const floorY = cupBottomY - p.radius - 3;
        if (p.y > floorY) {
          p.y = floorY;
          p.vy = -p.vy * damping;
          p.vx *= 0.85;
          if (Math.abs(p.vy) < 0.2) p.vy = 0;
        }

        // Tapered cup wall boundary collision
        const progressY = (p.y - cupTopY) / cupHeight;
        const currentHalfWidth = halfTop - progressY * (halfTop - halfBottom) - p.radius - 4;
        const leftWall = cx - currentHalfWidth;
        const rightWall = cx + currentHalfWidth;

        if (p.x < leftWall) {
          p.x = leftWall;
          p.vx = -p.vx * damping;
        } else if (p.x > rightWall) {
          p.x = rightWall;
          p.vx = -p.vx * damping;
        }

        // Inter-particle stacking collision (lightweight sphere-sphere)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p.radius + p2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            p.x -= nx * overlap;
            p.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            const relVx = p.vx - p2.vx;
            const relVy = p.vy - p2.vy;
            const impulse = (relVx * nx + relVy * ny) * 0.5;

            p.vx -= nx * impulse;
            p.vy -= ny * impulse;
            p2.vx += nx * impulse;
            p2.vy += ny * impulse;
          }
        }

        // Render Particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'jelly') {
          // Cuboid grass jelly / aloe
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);

          // Subtle glossy highlight
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(-p.radius + 2, -p.radius + 2, p.radius, 3);
        } else if (p.type === 'pudding') {
          // Custard block
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.roundRect(-p.radius * 1.3, -p.radius * 0.8, p.radius * 2.6, p.radius * 1.6, 6);
          ctx.fill();
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Chewy boba sphere
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Shiny 3D light reflection dot
          ctx.beginPath();
          ctx.arc(-p.radius * 0.35, -p.radius * 0.35, p.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();
        }

        ctx.restore();
      }

      // 5. Floating Ice Cubes
      iceCubesRef.current.forEach((cube) => {
        const bob = Math.sin(time * 2 + cube.bobOffset) * 2;
        ctx.save();
        ctx.translate(cube.x, cube.y + bob);
        ctx.rotate(cube.angle);

        // Translucent ice body
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-cube.size / 2, -cube.size / 2, cube.size, cube.size, 6);
        ctx.fill();
        ctx.stroke();

        // Inner refracted gleam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.roundRect(-cube.size / 2 + 3, -cube.size / 2 + 3, cube.size * 0.4, cube.size * 0.4, 3);
        ctx.fill();

        ctx.restore();
      });

      // 6. Draw Straw inside cup (behind glass highlight)
      if (strawInserted) {
        const strawTopX = cx + (strawXRatio - 0.5) * 80 + 35;
        const strawTopY = cupTopY - 70;
        const strawBottomX = cx + (strawXRatio - 0.5) * 40 - 20;
        const strawBottomY = cupBottomY - 14;

        ctx.save();
        ctx.strokeStyle = '#D9534F'; // Artisanal terracotta red / striped
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(strawTopX, strawTopY);
        ctx.lineTo(strawBottomX, strawBottomY);
        ctx.stroke();

        // White inner stripe on straw
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(strawTopX + 2, strawTopY + 2);
        ctx.lineTo(strawBottomX + 2, strawBottomY);
        ctx.stroke();

        // Straw diagonal opening cut at the bottom
        ctx.beginPath();
        ctx.moveTo(strawBottomX - 6, strawBottomY - 8);
        ctx.lineTo(strawBottomX + 6, strawBottomY + 2);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // end cup clipping

      // 7. Outer Glass Cup Shell & Curved Highlights
      ctx.save();
      // Cup outline
      ctx.beginPath();
      ctx.moveTo(pTopLeft.x, pTopLeft.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pBottomRight.x, pBottomRight.y);
      ctx.quadraticCurveTo(cx, cupBottomY + 12, pBottomLeft.x, cupBottomY);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Elegant glass rim top curve
      ctx.beginPath();
      ctx.ellipse(cx, cupTopY, halfTop, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vertical glass reflection highlight streak along left edge
      const highlightGrad = ctx.createLinearGradient(
        pTopLeft.x,
        cupTopY,
        pBottomLeft.x + 20,
        cupBottomY
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.35)');

      ctx.beginPath();
      ctx.moveTo(pTopLeft.x + 10, cupTopY + 14);
      ctx.lineTo(pTopLeft.x + 20, cupTopY + 14);
      ctx.lineTo(pBottomLeft.x + 22, cupBottomY - 14);
      ctx.lineTo(pBottomLeft.x + 12, cupBottomY - 14);
      ctx.closePath();
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      // Measurement line & typography mark on cup: "500ml / 700ml"
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + halfTop * 0.4, cupTopY + 65);
      ctx.lineTo(cx + halfTop * 0.65, cupTopY + 65);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText(drink.size === 'large' ? '700ml' : '500ml', cx + halfTop * 0.2, cupTopY + 68);

      // Sealed film lid (if sealed)
      if (drink.isSealed) {
        ctx.beginPath();
        ctx.ellipse(cx, cupTopY, halfTop + 4, 11, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#C89355'; // Artisanal gold foil seal
        ctx.fill();
        ctx.strokeStyle = '#A37237';
        ctx.lineWidth = 2;
        ctx.stroke();

        // BobaFlow logo seal emboss
        ctx.fillStyle = '#382312';
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOBAFLOW · CRAFT SEALED', cx, cupTopY + 3);

        // Straw puncture hole
        if (strawInserted) {
          const punctureX = cx + (strawXRatio - 0.5) * 80 + 10;
          ctx.beginPath();
          ctx.ellipse(punctureX, cupTopY, 10, 6, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#1D140D';
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    cupTopY,
    cupBottomY,
    cupHeight,
    cupWidthTop,
    cupWidthBottom,
    drink.size,
    drink.teaBase.color,
    drink.teaBase.secondaryColor,
    drink.milk.color,
    drink.milk.id,
    drink.syrupDrizzle,
    drink.toppings,
    drink.isSealed,
    strawInserted,
    strawXRatio,
  ]);

  // Action: Shake Cup
  const handleShakeCup = () => {
    if (isShaking) return;
    setIsShaking(true);
    bobaAudio.playShake();
    bobaAudio.playIceClink();

    // Give pearls an explosive upwards kinetic burst
    particlesRef.current.forEach((p) => {
      p.vy = -(8 + Math.random() * 12);
      p.vx = (Math.random() - 0.5) * 8;
      p.vRot = (Math.random() - 0.5) * 0.4;
    });

    setTimeout(() => {
      setIsShaking(false);
    }, 700);
  };

  // Action: Sip Through Straw
  const handleSipStraw = () => {
    if (isSipping) return;
    setIsSipping(true);
    bobaAudio.playStrawSlurp();

    // Suck up 1-2 boba pearls if available
    const particles = particlesRef.current;
    if (particles.length > 0) {
      // Remove one pearl or launch it upwards
      const removed = particles.pop();
      if (removed) {
        onDrinkChange({
          sipCount: (drink.sipCount || 0) + 1,
        });
      }
    }

    const compliments = [
      'Pure Tapioca Silk! ✨',
      'Perfect 50% Sweetness Harmony! 🧋',
      'Rich Caramelized Chew! 🍯',
      'Velvety Mountain Tea Notes! 🌿',
      'Crisp Chill Perfection! ❄️',
    ];
    const picked = compliments[Math.floor(Math.random() * compliments.length)];
    setSipEffectText(picked);

    setTimeout(() => {
      setIsSipping(false);
    }, 450);

    setTimeout(() => {
      setSipEffectText(null);
    }, 2000);
  };

  // Action: Toggle Seal Film Lid
  const handleToggleSeal = () => {
    const nextSealed = !drink.isSealed;
    bobaAudio.playSeal();
    onDrinkChange({ isSealed: nextSealed });
    if (!nextSealed) {
      setStrawSealedPop(true);
      setTimeout(() => setStrawSealedPop(false), 800);
    }
  };

  // Action: Add Extra Boba Plop
  const handleAddExtraPearls = () => {
    bobaAudio.playBobaDrop();
    const count = 6;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Date.now() + i,
        x: 180 + (Math.random() - 0.5) * 60,
        y: cupTopY + 40,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        radius: 8,
        color: '#24140D',
        borderColor: '#4A2A1A',
        type: 'pearl',
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Cup Canvas Container */}
      <div
        className={`relative transition-transform duration-200 ${
          isShaking ? 'animate-bounce scale-105 rotate-2' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          className="w-[280px] h-[373px] sm:w-[320px] sm:h-[426px] drop-shadow-xl cursor-pointer"
          onClick={handleShakeCup}
          title="Click to shake cup!"
        />

        {/* Floating sip compliment toast */}
        {sipEffectText && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#201D1A] text-[#FAF8F5] text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-amber-900/30 whitespace-nowrap animate-fade-in pointer-events-none">
            {sipEffectText}
          </div>
        )}

        {/* Straw position slide handler */}
        {strawInserted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] text-stone-600 shadow-sm border border-stone-200">
            <span>Straw:</span>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={strawXRatio}
              onChange={(e) => setStrawXRatio(parseFloat(e.target.value))}
              className="w-16 accent-amber-800 cursor-ew-resize h-1"
            />
          </div>
        )}
      </div>

      {/* Interactive Sensory Control Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-sm">
        <button
          onClick={handleShakeCup}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#ECE7DF] hover:bg-[#E3DCD1] text-[#332B24] rounded-lg transition-colors active:scale-95 shadow-sm"
          title="Shake drink with ice"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Shake Cup</span>
        </button>

        <button
          onClick={handleSipStraw}
          disabled={!strawInserted}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#3D2C1E] hover:bg-[#2B1E14] text-[#FAF8F5] rounded-lg transition-colors active:scale-95 shadow-sm"
          title="Sip boba through the straw"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Sip Straw ({drink.sipCount || 0})</span>
        </button>

        <button
          onClick={handleToggleSeal}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors active:scale-95 shadow-sm ${
            drink.isSealed
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-[#ECE7DF] hover:bg-[#E3DCD1] text-[#332B24]'
          }`}
          title="Heat-seal cup with airtight film"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{drink.isSealed ? 'Sealed (Tap Puncture)' : 'Seal Lid'}</span>
        </button>

        <button
          onClick={handleAddExtraPearls}
          className="px-3 py-2 text-xs font-medium text-[#7A6A5A] hover:text-[#332B24] hover:bg-[#F2ECE3] rounded-lg transition-colors"
          title="Drop extra boba pearls"
        >
          + Add Pearls
        </button>
      </div>

      {/* Drink Summary Quick Pills */}
      <div className="mt-3 flex items-center gap-2 text-xs text-[#7A6A5A]">
        <span>{drink.size === 'large' ? '700ml Grande' : '500ml Classic'}</span>
        <span aria-hidden="true">·</span>
        <span>{drink.sweetness}% Sweetness</span>
        <span aria-hidden="true">·</span>
        <span className="capitalize">{drink.ice.replace('-', ' ')}</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono-numbers text-[#3D2C1E] font-semibold">
          ${drink.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
