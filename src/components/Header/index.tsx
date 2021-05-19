import { useRouter } from 'next/router';
import Link from 'next/link'

import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export const Header = () => {
	const { asPath } = useRouter()

	return (
		<header className={styles.headerContainer}>
			<div className={styles.headerContent}>
				<img src="/images/logo.svg" alt=""/>

				<nav>
					<ActiveLink activeClassName={styles.activeLink} href="/">
						<a>Home</a>
					</ActiveLink>
					<ActiveLink activeClassName={styles.activeLink} href="/posts">
						<a>Posts</a>
					</ActiveLink>
				</nav>

				<SignInButton />
			</div>
		</header>
	)
}
