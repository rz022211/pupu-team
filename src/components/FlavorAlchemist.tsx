import React, { useState } from 'react';
import { CustomBobaDrink, SweetnessLevel, IceLevel } from '../types/boba';
import { TEA_BASES, MILK_OPTIONS, TOPPINGS } from '../data/bobaMenu';
import { Sparkles, Compass, Wand2, ArrowRight } from 'lucide-react';
import { bobaAudio } from '../utils/audio';

interface FlavorAlchemistProps {
  onApplyRecipe: (drink: CustomBobaDrink) => void;
}

interface MoodRecipe {
  id: string;
  name: string;
  mood: string;
  tagline: string;
  teaId: string;
  milkId: string;
  sweetness: SweetnessLevel;
  ice: IceLevel;
  toppings: string[];
  syrupDrizzle: 'none' | 'brown-sugar' | 'honey' | 'strawberry';
  sommelierQuote: string;
}

const PRESET_VIBES: MoodRecipe[] = [
  {
    id: 'zen-flow',
    name: 'Zen Mountain Dewdrop',
    mood: 'Calm & Deep Focus',
    tagline: 'High elevation charcoal oolong with subtle oat silk and slow-simmered herbal grass jelly.',
    teaId: 'roasted-oolong',
    milkId: 'organic-oat',
    sweetness: 30,
    ice: 'light',
    toppings: ['grass-jelly'],
    syrupDrizzle: 'none',
    sommelierQuote:
      'The toasted charcoal aroma grounds the mind while light oat milk softens the tannins without dulling your focus.',
  },
  {
    id: 'afternoon-spark',
    name: 'Solar Jasmine Bloom',
    mood: 'Sunny Afternoon Energy',
    tagline: 'Seven-scented jasmine silver tips with explosive lychee spheres and aloe crunch.',
    teaId: 'jasmine-silver',
    milkId: 'pure-straight',
    sweetness: 50,
    ice: 'regular',
    toppings: ['lychee-popping', 'crystal-aloe'],
    syrupDrizzle: 'none',
    sommelierQuote:
      'Bursting floral notes paired with cold juicy fruit spheres provide a crisp serotonin boost without heavy dairy weight.',
  },
  {
    id: 'velvet-hug',
    name: 'Okinawa Golden Slumber',
    mood: 'Cozy Evening Comfort',
    tagline: 'Warm organic taro mash, roasted Kokuto muscovado caramel, and cloud cream.',
    teaId: 'taro-velvet',
    milkId: 'coconut-cloud',
    sweetness: 70,
    ice: 'warm',
    toppings: ['brown-sugar-pearls', 'salted-cheese-foam'],
    syrupDrizzle: 'brown-sugar',
    sommelierQuote:
      'Warm served at 50°C. Silky mashed purple taro melts into coconut cream and warm brown sugar pearls for a cozy blanket in a cup.',
  },
  {
    id: 'matcha-clarity',
    name: 'Kyoto Morning Meditation',
    mood: 'Morning Clean Wake-Up',
    tagline: 'First-flush Uji shaded green matcha with wild honey pearls and oat froth.',
    teaId: 'uji-matcha',
    milkId: 'organic-oat',
    sweetness: 50,
    ice: 'light',
    toppings: ['golden-honey-boba'],
    syrupDrizzle: 'honey',
    sommelierQuote:
      'Rich L-theanine from shaded tea bushes pairs with sustained energy release from slow-cooked golden honey tapioca.',
  },
];

export const FlavorAlchemist: React.FC<FlavorAlchemistProps> = ({ onApplyRecipe }) => {
  const [selectedVibe, setSelectedVibe] = useState<MoodRecipe>(PRESET_VIBES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<MoodRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectVibe = (recipe: MoodRecipe) => {
    bobaAudio.playLiquidPour();
    setSelectedVibe(recipe);
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    bobaAudio.playShake();

    setTimeout(() => {
      const promptLower = customPrompt.toLowerCase();

      // Intelligent formula synthesis based on keywords
      let tea = TEA_BASES[0];
      if (promptLower.includes('green') || promptLower.includes('floral') || promptLower.includes('jasmine')) {
        tea = TEA_BASES.find((t) => t.id === 'jasmine-silver') || tea;
      } else if (promptLower.includes('matcha') || promptLower.includes('earthy')) {
        tea = TEA_BASES.find((t) => t.id === 'uji-matcha') || tea;
      } else if (promptLower.includes('taro') || promptLower.includes('purple') || promptLower.includes('sweet potato')) {
        tea = TEA_BASES.find((t) => t.id === 'taro-velvet') || tea;
      } else if (promptLower.includes('thai') || promptLower.includes('spice') || promptLower.includes('cinnamon')) {
        tea = TEA_BASES.find((t) => t.id === 'thai-sunset') || tea;
      } else if (promptLower.includes('black') || promptLower.includes('bold') || promptLower.includes('ruby')) {
        tea = TEA_BASES.find((t) => t.id === 'ruby-black-18') || tea;
      }

      let milk = MILK_OPTIONS[0];
      if (promptLower.includes('no milk') || promptLower.includes('clear') || promptLower.includes('crisp')) {
        milk = MILK_OPTIONS.find((m) => m.id === 'pure-straight') || milk;
      } else if (promptLower.includes('coconut')) {
        milk = MILK_OPTIONS.find((m) => m.id === 'coconut-cloud') || milk;
      } else if (promptLower.includes('rich') || promptLower.includes('whole') || promptLower.includes('guernsey')) {
        milk = MILK_OPTIONS.find((m) => m.id === 'whole-jersey') || milk;
      }

      let sweetness: SweetnessLevel = 50;
      if (promptLower.includes('no sugar') || promptLower.includes('zero') || promptLower.includes('unsweet')) {
        sweetness = 0;
      } else if (promptLower.includes('low') || promptLower.includes('less') || promptLower.includes('30')) {
        sweetness = 30;
      } else if (promptLower.includes('sweet') || promptLower.includes('dessert') || promptLower.includes('extra')) {
        sweetness = 70;
      }

      const toppings: string[] = ['brown-sugar-pearls'];
      if (promptLower.includes('jelly') || promptLower.includes('grass')) {
        toppings.push('grass-jelly');
      }
      if (promptLower.includes('foam') || promptLower.includes('cheese') || promptLower.includes('salty')) {
        toppings.push('salted-cheese-foam');
      }
      if (promptLower.includes('popping') || promptLower.includes('lychee')) {
        toppings.push('lychee-popping');
      }

      const createdRecipe: MoodRecipe = {
        id: 'bespoke-' + Date.now(),
        name: `Bespoke Alchemist Formulation: ${tea.name.split(' ')[0]} Fusion`,
        mood: 'Custom Craving Profile',
        tagline: `Engineered around "${customPrompt.slice(0, 50)}" with ${tea.roast.toLowerCase()} roasted leaves.`,
        teaId: tea.id,
        milkId: milk.id,
        sweetness,
        ice: promptLower.includes('warm') ? 'warm' : 'regular',
        toppings,
        syrupDrizzle: promptLower.includes('tiger') || promptLower.includes('brown sugar') ? 'brown-sugar' : 'none',
        sommelierQuote: `Balanced to highlight ${tea.name} with ${sweetness}% sweetness ratio and ${toppings.length} curated textural toppings.`,
      };

      setGeneratedRecipe(createdRecipe);
      setSelectedVibe(createdRecipe);
      setIsGenerating(false);
    }, 450);
  };

  const handleBrewNow = (recipe: MoodRecipe) => {
    const tea = TEA_BASES.find((t) => t.id === recipe.teaId) || TEA_BASES[0];
    const milk = MILK_OPTIONS.find((m) => m.id === recipe.milkId) || MILK_OPTIONS[0];
    const toppings = TOPPINGS.filter((t) => recipe.toppings.includes(t.id));

    const constructed: CustomBobaDrink = {
      id: 'drink-' + Date.now(),
      name: recipe.name,
      size: 'regular',
      teaBase: tea,
      milk,
      sweetness: recipe.sweetness,
      ice: recipe.ice,
      toppings,
      syrupDrizzle: recipe.syrupDrizzle,
      price:
        tea.basePrice +
        milk.price +
        toppings.reduce((acc, t) => acc + t.price, 0) +
        (recipe.syrupDrizzle !== 'none' ? 0.6 : 0),
      calories: 320,
      isSealed: false,
      sipCount: 0,
    };

    bobaAudio.playLiquidPour();
    onApplyRecipe(constructed);

    // Smooth scroll to Boba Lab canvas
    const labEl = document.getElementById('boba-lab');
    if (labEl) {
      labEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="flavor-alchemist" className="py-12 border-t border-[#EAE2D5] bg-[#F7F2EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A67C52]">
              Sensory Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#2B1D12] mt-1">
              Flavor Alchemist & Mood Matcher
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6A5A] mt-1 max-w-xl">
              Tell us your mental frequency or sensory craving. Our recipe engine calibrates tea
              body, milk viscosity, and boba elasticity to match your vibe.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#7A6A5A]">
            <Compass className="w-4 h-4 text-[#A67C52]" />
            <span>Interactive Sommelier</span>
          </div>
        </div>

        {/* Custom Craving Prompt Box */}
        <form
          onSubmit={handleGenerateCustom}
          className="mb-8 p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex items-center gap-2 w-full flex-1">
            <Wand2 className="w-4 h-4 text-[#A67C52] shrink-0" />
            <input
              type="text"
              placeholder="e.g. 'Toasty earthy matcha with very little sugar, salty cheese foam, and maximum chew'..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full text-xs sm:text-sm text-[#2B1D12] placeholder-[#A69788] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !customPrompt.trim()}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#3D2C1E] hover:bg-[#2B1E14] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            {isGenerating ? 'Synthesizing...' : 'Synthesize Formula'}
          </button>
        </form>

        {/* Preset Mood Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {PRESET_VIBES.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => handleSelectVibe(recipe)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedVibe.id === recipe.id
                  ? 'bg-white border-[#3D2C1E] shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#D1B89D]'
              }`}
            >
              <span className="text-[11px] font-semibold text-[#A67C52] block uppercase tracking-wide">
                {recipe.mood}
              </span>
              <h4 className="text-sm font-semibold text-[#2B1D12] mt-1">{recipe.name}</h4>
              <p className="text-xs text-[#7A6A5A] mt-1 line-clamp-2">{recipe.tagline}</p>
            </button>
          ))}
        </div>

        {/* Active Vibe Tasting Breakdown Panel */}
        <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#A67C52] uppercase tracking-wider">
                Formula Profile
              </span>
              <span aria-hidden="true" className="text-stone-300">
                ·
              </span>
              <span className="text-xs text-[#7A6A5A]">{selectedVibe.mood}</span>
            </div>

            <h3 className="text-xl font-display font-semibold text-[#2B1D12]">
              {selectedVibe.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5A4B] leading-relaxed">
              "{selectedVibe.sommelierQuote}"
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#7A6A5A]">
              <span>Base: {selectedVibe.teaId.replace('-', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedVibe.sweetness}% Sweet</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{selectedVibe.ice}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedVibe.toppings.length} Curated Topping(s)</span>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleBrewNow(selectedVibe)}
              className="w-full sm:w-auto py-3 px-6 bg-[#3D2C1E] hover:bg-[#2B1E14] text-white text-xs font-semibold rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Load Recipe into Boba Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
