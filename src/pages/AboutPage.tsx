import { Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Divider,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

/**
 * About Page
 * 
 * Provides platform overview, navigation guide, FAQ, and contact information.
 * Public page - accessible to everyone.
 */
export function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the SLIAC Fantasy Football platform. Learn how to navigate and use the platform effectively.
        </Typography>
      </Box>

      {/* Platform Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Platform Overview
          </Typography>
          <Typography variant="body1" paragraph>
            The SLIAC Fantasy Football platform is a fantasy sports management platform designed for 
            tracking players, managing your squad, and competing in leagues using data from the SLIAC mens D3 soccer. Whether you're a casual fan or a 
            strategic manager, this platform provides all the tools you need to build and manage your fantasy team.
          </Typography>
          <Typography variant="body1" paragraph>
            Get started by browsing players and fixtures, or create an account to build your squad and join leagues 
            to compete with others.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            <strong>Note:</strong> This platform is just for fun! Enjoy the friendly competition and enjoy managing your fantasy team.
          </Typography>
        </CardContent>
      </Card>

      {/* Platform Status / Testing Mode Notice */}
      <Card sx={{ mb: 4, bgcolor: 'info.dark', color: 'info.contrastText' }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Platform Status: Testing Mode
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Note:</strong> The current season has ended, and the platform is now operating in a testing/observation mode. 
            To facilitate testing and allow users to explore how the platform works, several restrictions have been relaxed:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>You can select and modify squads for past gameweeks (this is normally restricted during an active season)</li>
            <li>Squad changes can be made at any time, regardless of gameweek status</li>
            <li>These relaxed rules allow for comprehensive testing and observation of platform functionality</li>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            During an active season, squad changes would be locked once gameweeks begin, and you would only be able 
            to modify your squad for upcoming gameweeks. The current testing mode provides full flexibility to explore 
            and understand the platform's features.
          </Typography>
        </CardContent>
      </Card>

      {/* Navigation Guide */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            How to Navigate the Platform
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Public Pages (Available to Everyone)
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Players
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Browse all available players in the league. View player information, statistics, and performance 
                data. Click on any player to see detailed stats for different gameweeks. You can filter players 
                by team, position, and cost to find the perfect additions to your squad.
              </Typography>
              <MuiLink component={Link} to="/players" color="primary">
                Explore Players →
              </MuiLink>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Fixtures
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View all match fixtures and results across different gameweeks. Select a gameweek from the dropdown 
                to see all matches scheduled for that period. Click on any fixture to see detailed match information 
                and player statistics.
              </Typography>
              <MuiLink component={Link} to="/fixtures" color="primary">
                View Fixtures →
              </MuiLink>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Protected Pages (Requires Account)
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your personalized home page after logging in. View the current gameweek, preview your squad, 
                and see an overview of your leagues. This is your central hub for managing your fantasy football experience.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Squad
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Build and manage your fantasy team. Select players within your budget, organize your lineup, 
                and make transfers between gameweeks. Your squad's performance directly affects your league standings 
                and overall points.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Leagues
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Join public leagues or create private leagues to compete with friends. View league standings, 
                compare your performance with other managers, and track your ranking throughout the season.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Frequently Asked Questions
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  How do I get started?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Start by exploring the Players and Fixtures pages to familiarize yourself with the platform. 
                  To build your squad and join leagues, create an account using the Register button in the top 
                  right corner. Once registered and logged in, you can access your Dashboard, build your Squad, 
                  and join Leagues.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  How do I create or join a league?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  After logging in, navigate to the Leagues page. You can create a new private league or join 
                  existing public leagues. Private leagues require a league code that you can share with friends. 
                  Once you're in a league, your squad's performance will be tracked and compared with other managers.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  How does squad management work?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  In the Squad page, you can select players to build your fantasy team. Each player has a cost, 
                  and you have a budget limit. Choose players strategically based on their position, cost, and 
                  performance. You can make changes to your squad between gameweeks, but make sure to stay within 
                  your budget constraints.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  How are points calculated?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Points are awarded based on player performance in real matches. The point system varies by position. 
                    Check individual player stats on the Players page to see detailed performance metrics.
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Goals by Position
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Forward:</strong> 5 points per goal
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Midfielder:</strong> 6 points per goal
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Defender:</strong> 8 points per goal
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Goalkeeper:</strong> 8 points per goal
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Other Positive Actions
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Assist:</strong> 3 points (all positions)
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Clean Sheet:</strong> 4 points
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Goalkeeper Saves Bonus:</strong> 1 point per 3 saves (minimum 3 saves required)
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Full Match (90 minutes):</strong> 2 points
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Partial Match:</strong> 1 point
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Negative Actions (Point Deductions)
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Yellow Card:</strong> -1 point
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Red Card:</strong> -3 points
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      <strong>Goal Conceded:</strong> -1 point per goal conceded
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Note: Points are calculated automatically based on match statistics. Captain points are doubled, 
                    and vice-captain points are used if the captain doesn't play.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Can I change my squad after the gameweek has started?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Squad changes can typically be made before a gameweek starts. Once a gameweek begins, your squad 
                  is locked for that period but for now you can change your squad at any time since we are in testing mode. Make sure to review and finalize your squad before the deadline to 
                  maximize your points potential.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            About This Platform
          </Typography>
          <Typography variant="body1" paragraph>
            The SLIAC Fantasy Football platform is designed to bring fantasy sports management from SLIAC mens D3 soccer to life. 
            Built with modern web technologies, the platform provides a seamless experience for managing 
            your team, tracking performance, and competing with others.
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you're following your favorite players, building the ultimate squad, or competing for 
            the top spot in your league, this platform provides all the tools and information you need 
            for an engaging fantasy football experience.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            <strong>Note:</strong> This platform is just for fun! Enjoy the friendly competition and enjoy managing your fantasy team.
          </Typography>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Contact & Support
          </Typography>
          <Typography variant="body1" paragraph>
            Found a bug or experiencing unexpected behavior? I'd love to hear from you! Please reach out 
            to me through one of the channels below:
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              <MuiLink 
                href="https://www.linkedin.com/in/kesienaberezi/" 
                target="_blank" 
                rel="noopener noreferrer"
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                LinkedIn
              </MuiLink>
            </Typography>
            
            <Typography variant="body1">
              <MuiLink 
                href="mailto:berezikesiena@gmail.com"
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Email: berezikesiena@gmail.com
              </MuiLink>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> When reporting bugs, please include as much detail as possible about 
              the issue, including what you were doing when it occurred and any error messages you may have seen. 
              This helps me resolve issues more quickly.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

