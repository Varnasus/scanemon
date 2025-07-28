# Scanémon CLI Preview Tool

A command-line interface for testing and previewing the Scanémon card scanning functionality.

## Features

- 🔍 **Scan Images**: Upload and scan Pokémon card images
- 📊 **View Results**: See detailed card information and confidence scores
- 📚 **History Tracking**: View recent scan history and statistics
- 🎴 **Card Database**: List all available cards in the hardcoded set
- ✅ **Accept/Reject**: Choose whether to accept scan results

## Usage

### Basic Scanning
```bash
python scan_preview.py <image_path>
```

### List Available Cards
```bash
python scan_preview.py --list-cards
```

### View Scan History
```bash
python scan_preview.py --history
```

### View Statistics
```bash
python scan_preview.py --stats
```

### Help
```bash
python scan_preview.py --help
```

## Example Output

```
🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴
    SCANÉMON CLI PREVIEW
🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴🎴

🔍 Scanning: pikachu.jpg

📋 CARD INFORMATION
========================================
Name:      Pikachu
Set:       Base Set
Rarity:    Common
Type:      Electric
HP:        40
Confidence: 420.00%

🔍 SCAN METADATA
========================================
Timestamp:     2024-01-01T12:00:00Z
Filename:      pikachu.jpg
Model Version: fake_v1

💬 AI THOUGHTS
========================================
🎉 WOW! I'm 420% sure this is the card! That's like...
   mathematically impossible but totally awesome! 🤯

🤔 Do you want to accept this scan result?
   (y) Yes, add to my collection
   (n) No, try again
   (q) Quit

Your choice (y/n/q): y
✅ Scan accepted and added to history!
   Your collection is growing! 📚
```

## Available Cards

The CLI tool works with the hardcoded set of 10 Pokémon cards:

1. **Pikachu** (Base Set) - Common - Electric
2. **Charizard** (Base Set) - Ultra Rare - Fire  
3. **Mew** (Promo) - Rare - Psychic
4. **Mewtwo** (Base Set) - Rare - Psychic
5. **Bulbasaur** (Base Set) - Common - Grass
6. **Squirtle** (Base Set) - Common - Water
7. **Eevee** (Jungle) - Common - Colorless
8. **Umbreon** (Neo Discovery) - Rare - Darkness
9. **Ditto** (Fossil) - Common - Colorless
10. **Magikarp** (Base Set) - Common - Water

## Current Implementation

- **Model**: Fake model that always returns Pikachu with 420% confidence
- **Storage**: Local JSON file for scan history (last 15 accepted scans)
- **Future**: Will be replaced with real CLIP model hosted on Replicate/Modal

## Files

- `scan_preview.py` - Main CLI tool
- `scan_history.json` - Local scan history storage
- `ml/predict.py` - Card prediction logic
- `api/app/core/scan_logger.py` - Scan logging system

## Development

This tool is part of the MVP implementation. Future versions will include:

- Real ML model integration
- Cloud storage for scan history
- Enhanced card database
- Video scanning support
- Performance analytics 