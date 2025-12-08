/**
 * ⛔ LOCKED - AI Toggle Service
 * 
 * Controls whether AI is enabled or disabled
 * Used for testing or playing without AI opponent
 */

class AIToggleService {
  private isAIEnabled: boolean = true;

  /**
   * Check if AI is currently enabled
   */
  isEnabled(): boolean {
    return this.isAIEnabled;
  }

  /**
   * Enable AI opponent
   */
  enable(): void {
    this.isAIEnabled = true;
    console.log('✅ AI Opponent ENABLED');
  }

  /**
   * Disable AI opponent
   */
  disable(): void {
    this.isAIEnabled = false;
    console.log('⛔ AI Opponent DISABLED');
  }

  /**
   * Toggle AI on/off
   */
  toggle(): boolean {
    this.isAIEnabled = !this.isAIEnabled;
    console.log(this.isAIEnabled ? '✅ AI Opponent ENABLED' : '⛔ AI Opponent DISABLED');
    return this.isAIEnabled;
  }
}

export const aiToggleService = new AIToggleService();
