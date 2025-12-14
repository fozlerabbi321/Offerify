import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Auth Guard
 * Extracts user from JWT if present, but doesn't require authentication.
 * Allows both authenticated and unauthenticated access.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        // Don't throw error if no user - just return null/undefined
        return user || null;
    }
}
