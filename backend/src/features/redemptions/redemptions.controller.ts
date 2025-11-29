import { Controller, Post, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Redemptions')
@Controller('redemptions')
export class RedemptionsController {
    constructor(private readonly redemptionsService: RedemptionsService) { }

    @Post(':offerId/claim')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Claim an offer (Customer)' })
    @ApiResponse({ status: 201, description: 'Offer claimed successfully' })
    @ApiResponse({ status: 400, description: 'Vouchers sold out or offer unavailable' })
    @ApiResponse({ status: 409, description: 'Already claimed' })
    async claim(@Request() req, @Param('offerId') offerId: string) {
        return this.redemptionsService.claim(req.user.userId, offerId);
    }

    @Patch(':id/verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify a redemption (Vendor)' })
    @ApiResponse({ status: 200, description: 'Redemption verified successfully' })
    @ApiResponse({ status: 403, description: 'Not authorized to verify this redemption' })
    @ApiResponse({ status: 404, description: 'Redemption not found' })
    @ApiResponse({ status: 409, description: 'Redemption already used' })
    async verify(@Request() req, @Param('id') id: string) {
        // We assume the user is a vendor. The service checks ownership.
        // Ideally we should resolve vendorId from user.vendorProfile.id
        // But for now let's assume the service can handle it or we fetch it here.
        // Wait, the service expects vendorId. 
        // We need to get the vendorId from the logged in user.
        // The req.user has the user payload. 
        // If the user is a vendor, they should have a vendor profile.
        // We might need to fetch the vendor profile or assume it's in the token if we put it there.
        // Let's assume we need to fetch it or the user.id is NOT the vendorId.
        // The service `verify(vendorId, redemptionId)` checks `redemption.offer.vendor.id === vendorId`.
        // So we need to pass the VENDOR ID, not the USER ID.

        // However, in `VendorsService` (from previous context), we might have a way to get vendor profile.
        // Or we can just pass userId and let service find the vendor profile?
        // The service signature is `verify(vendorId: string, redemptionId: string)`.
        // So it expects vendorId.

        // Let's update the service to accept userId and resolve vendorId, OR resolve it here.
        // Resolving it here is better for separation.
        // But we don't have VendorsService injected here.

        // Let's inject VendorsService? Or just use a helper.
        // Actually, `req.user` might not have vendorId unless we added it to the JWT.
        // If we didn't, we need to query.

        // For now, I will assume we can get it from `req.user.vendorProfileId` if it was in JWT, 
        // OR I will modify the service to accept userId and find the vendor profile.
        // Modifying the service is safer as it guarantees we get the correct vendor profile for the user.

        // But wait, I already implemented `verify(vendorId, ...)` in service.
        // I should probably keep it as `vendorId` for flexibility, but maybe add a helper or just fetch it here.
        // But I don't have `VendorsService` here.

        // Let's look at `User` entity. It has `vendorProfile`.
        // If I use `req.user.id`, I can find the user and their vendor profile.
        // But that requires `UsersService` or `VendorsService`.

        // Let's change the `RedemptionsService.verify` to accept `userId` and look up the vendor profile?
        // That would couple it to User/Vendor lookup.

        // Alternatively, I can inject `VendorsService` into `RedemptionsController`.
        // I will do that. I need to import `VendorsModule` in `RedemptionsModule`.

        // Wait, I can't easily change the module structure right now without editing multiple files.
        // Let's see if I can just pass `req.user.id` and have the service handle it?
        // The service currently compares `redemption.offer.vendor.id === vendorId`.
        // If I pass `userId`, it will fail.

        // I will update `RedemptionsService` to accept `userId` and find the vendor profile.
        // This seems the most robust way given the current context.
        // I need to inject `VendorProfile` repository into `RedemptionsService`.

        // Let's update `RedemptionsService` first.
        // But I am in the Controller step.

        // Let's assume for now I will update the service.
        // So controller will pass `req.user.id`.
        return this.redemptionsService.verifyRedemptionAsVendor(req.user.userId, id);
    }
}
