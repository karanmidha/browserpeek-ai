import { supabase } from '../../utils/supabase';
import type { User } from '@supabase/supabase-js';

export interface AdminUser extends User {
  user_metadata: {
    role?: 'admin' | 'instructor' | 'student';
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthSession {
  user: AdminUser;
  expiresAt: number;
  lastActivity: number;
}

// Session timeout: 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;

export class AdminAuth {
  private static instance: AdminAuth;
  private currentSession: AuthSession | null = null;
  private sessionTimer: number | null = null;

  private constructor() {
    this.initializeSessionMonitoring();
  }

  public static getInstance(): AdminAuth {
    if (!AdminAuth.instance) {
      AdminAuth.instance = new AdminAuth();
    }
    return AdminAuth.instance;
  }

  /**
   * Initialize session monitoring and auto-logout
   */
  private initializeSessionMonitoring(): void {
    // Check for existing session on page load
    this.checkExistingSession();

    // Monitor auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.handleSignIn(session.user as AdminUser);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });

    // Monitor user activity for session timeout
    this.setupActivityMonitoring();
  }

  /**
   * Check for existing session on app start
   */
  private async checkExistingSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const user = session.user as AdminUser;
        if (await this.isAdminUser(user)) {
          this.handleSignIn(user);
        } else {
          // Non-admin user trying to access admin panel
          await this.signOut();
          throw new Error('Access denied: Admin privileges required');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }

  /**
   * Handle successful sign-in
   */
  private handleSignIn(user: AdminUser): void {
    const now = Date.now();
    this.currentSession = {
      user,
      expiresAt: now + SESSION_TIMEOUT,
      lastActivity: now,
    };

    this.startSessionTimer();
    this.logAdminAction('admin.login', null, null, { user_id: user.id });
  }

  /**
   * Handle sign-out
   */
  private handleSignOut(): void {
    if (this.currentSession) {
      this.logAdminAction('admin.logout', null, null, {
        user_id: this.currentSession.user.id
      });
    }

    this.currentSession = null;
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Setup activity monitoring for session timeout
   */
  private setupActivityMonitoring(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const updateActivity = () => {
      if (this.currentSession) {
        this.currentSession.lastActivity = Date.now();
        this.currentSession.expiresAt = Date.now() + SESSION_TIMEOUT;
        this.startSessionTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  /**
   * Start session timeout timer
   */
  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      this.signOut();
      alert('Your session has expired. Please sign in again.');
    }, SESSION_TIMEOUT) as unknown as number;
  }

  /**
   * Check if user has admin role
   */
  private async isAdminUser(user: User): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * Sign in with email and password
   */
  public async signIn(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    requiresMFA?: boolean;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const isAdmin = await this.isAdminUser(data.user);
        if (!isAdmin) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access denied: Admin privileges required',
          };
        }

        // Check if MFA is enabled
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (factors && (factors as any)?.all?.length > 0) {
          return {
            success: false,
            requiresMFA: true,
          };
        }

        return { success: true };
      }

      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  /**
   * Verify MFA token
   */
  public async verifyMFA(token: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (!factors || (factors as any)?.all?.length === 0) {
        return {
          success: false,
          error: 'No MFA factors found',
        };
      }

      const factor = (factors as any)?.all?.[0];
      const { error } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: factor.challenge_id,
        code: token,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MFA verification failed',
      };
    }
  }

  /**
   * Enable MFA for current user
   */
  public async enableMFA(): Promise<{
    success: boolean;
    secret?: string;
    qrCode?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin Panel Access',
      });

      if (error) throw error;

      this.logAdminAction('admin.mfa.enable', null, null, {
        factor_id: data.id,
      });

      return {
        success: true,
        secret: data.totp.secret,
        qrCode: data.totp.qr_code,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable MFA',
      };
    }
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * Get current authenticated session
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentSession !== null &&
           this.currentSession.expiresAt > Date.now();
  }

  /**
   * Force re-authentication for sensitive operations
   */
  public async requireReAuth(password: string): Promise<boolean> {
    if (!this.currentSession) return false;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: this.currentSession.user.email!,
        password,
      });

      if (error) throw error;

      this.logAdminAction('admin.reauth', null, null, {
        user_id: this.currentSession.user.id,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Log admin actions for audit trail
   */
  private async logAdminAction(
    action: string,
    targetId: string | null,
    targetType: string | null,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      if (!this.currentSession) return;

      await supabase.from('audit_logs').insert({
        admin_id: this.currentSession.user.id,
        action,
        target_id: targetId,
        target_type: targetType,
        new_value: metadata || null,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const adminAuth = AdminAuth.getInstance();