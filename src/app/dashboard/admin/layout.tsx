import { AdminGuard } from 'src/auth/guard/admin-guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return <AdminGuard>{children}</AdminGuard>;
}
