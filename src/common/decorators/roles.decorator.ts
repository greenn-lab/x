import { SetMetadata } from '@nestjs/common';

import { ROLE_KEY } from '@app/common/constants/metadata.constant';
import { MemberRole } from '@app/types/common/base.type';

export const Roles = (role: MemberRole) => SetMetadata(ROLE_KEY, role);
