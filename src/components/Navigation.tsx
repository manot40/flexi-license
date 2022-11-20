import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from './AuthContext';
import { useViewportSize } from '@mantine/hooks';
import { NavigationProgress, startNavigationProgress, completeNavigationProgress } from '@mantine/nprogress';
import { Navbar, Center, Tooltip, UnstyledButton, createStyles, Stack, Text, Burger, Box } from '@mantine/core';

import { TablerIcon, IconHome2, IconLogout, IconAffiliate, IconUsers } from '@tabler/icons';

export default function Navigation() {
  const r = useRouter();
  const { logout, user } = useAuth();
  const { width } = useViewportSize();
  const [isOpen, setOpen] = useState(false);

  const isWide = width >= 768;
  const isSidebarOpen = isWide || isOpen;

  useEffect(() => {
    const handleStart = (url: string) => url !== r.asPath && startNavigationProgress();
    const handleComplete = () => completeNavigationProgress();

    r.events.on('routeChangeStart', handleStart);
    r.events.on('routeChangeComplete', handleComplete);
    r.events.on('routeChangeError', handleComplete);

    return () => {
      r.events.off('routeChangeStart', handleStart);
      r.events.off('routeChangeComplete', handleComplete);
      r.events.off('routeChangeError', handleComplete);
    };
  }, [r.asPath, r.events]);

  if (!r.pathname.includes('dashboard')) return null;

  return (
    <>
      <NavigationProgress autoReset={true} />
      <Navbar
        p="md"
        style={{ translate: !isSidebarOpen ? '-100%' : '0' }}
        width={{ base: 280, sm: 80 }}
        sx={(theme) => ({
          top: 0,
          position: 'fixed',
          transition: 'translate 0.2s ease-in-out',
          '@media (min-width: 768px)': {
            position: 'static',
          },
          backgroundColor: theme.fn.variant({
            variant: 'filled',
            color: theme.primaryColor,
          }).background,
        })}>
        <Center>
          <IconAffiliate color="#FFF" size={32} />
        </Center>
        <Navbar.Section grow mt={50}>
          <Stack justify="center" spacing={0}>
            {menu
              .filter(({ roles }) => (roles ? roles.includes(user!.role) : true))
              .map((link) => (
                <NavbarLink
                  {...link}
                  isWide={isWide}
                  key={link.label}
                  active={!link.label ? r.pathname === '/dashboard' : r.pathname.includes(link.label)}
                  onClick={() => (setOpen(!open), r.push(`/dashboard/${link.label}`))}
                />
              ))}
          </Stack>
        </Navbar.Section>
        <Navbar.Section>
          <Stack justify="center" spacing={0}>
            <NavbarLink isWide={isWide} icon={IconLogout} label="Logout" onClick={logout} />
          </Stack>
        </Navbar.Section>
      </Navbar>
      {width >= 768 ? null : (
        <Box
          sx={(theme) => ({
            position: 'fixed',
            bottom: 24,
            right: 24,
            borderRadius: 999,
            background: theme.fn.variant({
              variant: 'filled',
              color: theme.primaryColor,
            }).background,
          })}
          p="sm">
          <Burger color="white" opened={isOpen} size="md" onClick={() => setOpen((o) => !o)} />
        </Box>
      )}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  link: {
    width: 'auto',
    height: 50,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    color: theme.white,
    opacity: 0.85,
    padding: '0 .85rem',

    '@media (min-width: 768px)': {
      justifyContent: 'center',
    },

    '&:hover': {
      opacity: 1,
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.1
      ),
    },
  },

  active: {
    opacity: 1,
    '&, &:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.15
      ),
    },
  },
}));

interface NavbarLinkProps {
  isWide: boolean;
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label: _label, active, onClick, isWide }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  const label = _label ? _label[0].toUpperCase() + _label.substring(1) : 'Dashboard';

  return (
    <Tooltip label={label} disabled={!isWide} position="right" transition="pop-top-left" transitionDuration={100}>
      <UnstyledButton mb={8} onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
        <Icon stroke={1.5} />
        {isWide ? null : (
          <Text ml={8} component="span">
            {label}
          </Text>
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

const menu = [
  { icon: IconHome2, label: '' },
  { icon: IconUsers, label: 'users', roles: ['ADMIN'] },
];
