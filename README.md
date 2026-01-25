# imgncli

A terminal-based AI image generator that creates images from text prompts using OpenRouter API. Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLI) and [Bun](https://bun.sh/).

https://github.com/user-attachments/assets/2a3c3bae-d0e7-46d3-9c80-52de987ca3da

## ✨ Features

- 🎨 **AI Image Generation** - Generate images from text prompts using AI models
- 🖼️ **Terminal Image Display** - View generated images directly in your terminal
- 📁 **History Management** - Browse and revisit your previously generated images
- 💾 **Save Images** - Save generated images to your current directory
- 🔧 **Multiple AI Models** - Choose between different image generation models

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- An [OpenRouter](https://openrouter.ai/) API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/imgncli.git
cd imgncli
```

2. Install dependencies:

```bash
bun install
```

3. Run the application:

```bash
bun start
```

### Configuration

On first run, use the `/setup` command to configure your OpenRouter API key:

```
/setup
```

## 📖 Usage

### Commands

| Command    | Description                              |
|------------|------------------------------------------|
| `/setup`   | Configure your OpenRouter API key        |
| `/models`  | Select a different AI model              |
| `/history` | Browse previously generated images       |
| `/clear`   | Clear your generation history            |

### Generating Images

Simply type your prompt and press Enter:

```
A futuristic cityscape at sunset with flying cars
```

### Keyboard Shortcuts

- **Enter** - Submit prompt / Confirm action
- **S** - Save the currently displayed image to your current directory
- **Esc** - Go back to the previous screen
- **Ctrl+C** (twice) - Exit the application

## 🛠️ Development

Run in watch mode for development:

```bash
bun dev
```

Type checking:

```bash
bun run typecheck
```

## 🏗️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **UI Framework**: [Ink](https://github.com/vadimdemedes/ink) (React for CLIs)
- **Image Display**: [ink-picture](https://github.com/StefanWerworsch/ink-picture)
- **Database**: [lowdb](https://github.com/typicode/lowdb) for local storage
- **API**: [OpenRouter](https://openrouter.ai/) for AI image generation

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- 🌍 Add support for more AI models
- 🎨 Improve the terminal UI/UX
- 📝 Add prompt history and suggestions
- 🔄 Add image regeneration with variations
- 🧪 Add tests
- 📚 Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ using Bun and Ink
