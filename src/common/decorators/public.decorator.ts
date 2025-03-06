import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '@app/common/constants/metadata.constant';

// 인증을 건너뛰기 위한 Public 데코레이터
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
