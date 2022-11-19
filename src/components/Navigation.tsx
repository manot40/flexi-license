import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from './AuthContext';
import { useViewportSize } from '@mantine/hooks';
import { NavigationProgress, startNavigationProgress, completeNavigationProgress } from '@mantine/nprogress';
import { Navbar, Center, Tooltip, UnstyledButton, createStyles, Stack, Text, Burger, Paper } from '@mantine/core';

import { TablerIcon, IconHome2, IconLogout, IconAffiliate, IconAddressBook } from '@tabler/icons';

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
  vw: number;
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

export default function Navigation() {
  const { logout } = useAuth();
  const { width } = useViewportSize();
  const router = useRouter();

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => url !== router.asPath && startNavigationProgress();
    const handleComplete = () => completeNavigationProgress();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.asPath, router.events]);

  if (!router.pathname.includes('dashboard')) return null;

  return (
    <>
      <NavigationProgress autoReset={true} />
      <Navbar
        p="md"
        style={{ translate: width <= 768 && !isOpen ? '-100%' : '0' }}
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
            {menu.map((link) => (
              <NavbarLink
                {...link}
                vw={width}
                key={link.label}
                active={router.pathname.includes(link.label)}
                onClick={() => router.push(`/${link.label}`)}
              />
            ))}
          </Stack>
        </Navbar.Section>
        <Navbar.Section>
          <Stack justify="center" spacing={0}>
            <NavbarLink vw={width} icon={IconLogout} label="Logout" onClick={logout} />
          </Stack>
        </Navbar.Section>
      </Navbar>
      {width >= 768 ? null : (
        <Paper style={{ position: 'fixed', bottom: 24, right: 24 }} withBorder p="sm" radius={999} shadow="sm">
          <Burger opened={isOpen} size="md" onClick={() => setOpen((o) => !o)} />
        </Paper>
      )}
    </>
  );
}

function NavbarLink({ icon: Icon, label: _label, active, onClick, vw }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  const label = _label[0].toUpperCase() + _label.substring(1);

  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <UnstyledButton mb={8} onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
        <Icon stroke={1.5} />
        {vw >= 768 ? null : (
          <Text ml={8} component="span">
            {label}
          </Text>
        )}
      </UnstyledButton>
    </Tooltip>
  );
}

const menu = [
  { icon: IconHome2, label: 'dashboard' },
  { icon: IconAddressBook, label: 'company' },
];
