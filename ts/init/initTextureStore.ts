export class TextureStore {
  textures: { [id: string]: string }

  async loadTexture(id: string, base64: string) {
    // if the texture already exists, we can basically symlink the id to that texture
  }

  // TODO:
  getTexture(id: string): string | undefined {
    return undefined
  }
}

export const initTextureStore = () => {
  globalThis.textureStore = new TextureStore()
}
