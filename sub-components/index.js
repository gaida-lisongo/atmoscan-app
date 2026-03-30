/**
 * The folder sub-components contains sub component of all the pages,
 * so here you will find folder names which are listed in root pages.
 */

// sub components for /pages/dashboard
import EntrepriseManager from 'sub-components/dashboard/EntrepriseManager';
import UserManager from 'sub-components/dashboard/UserManagerSimple';
import ActiveProjects from 'sub-components/dashboard/ActiveProjects';
import TasksPerformance from 'sub-components/dashboard/TasksPerformance';
import SourceManager from 'sub-components/dashboard/SourceManager';
import SourcesChart from 'sub-components/dashboard/SourcesChart';
import GesChart from 'sub-components/dashboard/GesChart';
import Teams from 'sub-components/dashboard/Teams';
import GazManager from 'sub-components/dashboard/GazManager';

// sub components for /pages/profile
import AboutMe from 'sub-components/profile/AboutMe';
import UserOverview from 'sub-components/profile/UserOverview';
import UserPrivilegies from 'sub-components/profile/UserPrivilegies';
import ActivityFeed from 'sub-components/profile/ActivityFeed';
import MyTeam from 'sub-components/profile/MyTeam';
import ProfileHeader from 'sub-components/profile/ProfileHeader';
import UserBanner from 'sub-components/profile/UserBanner';
import EntrepriseDetail from 'sub-components/profile/EntrepriseDetail';
import EntrepriseCarbonDashboard from 'sub-components/profile/EntrepriseCarbonDashboard';
import ProjectsContributions from 'sub-components/profile/ProjectsContributions';
import PollutionsDetail from 'sub-components/profile/PollutionsDetail';
import RecentFromBlog from 'sub-components/profile/RecentFromBlog';

// sub components for /pages/billing
import CurrentPlan from 'sub-components/billing/CurrentPlan';
import BillingAddress from 'sub-components/billing/BillingAddress';

// sub components for /pages/settings
import DeleteAccount from 'sub-components/settings/DeleteAccount';
import EmailSetting from 'sub-components/settings/EmailSetting';
import GeneralSetting from 'sub-components/settings/GeneralSetting';
import Notifications from 'sub-components/settings/Notifications';
import Preferences from 'sub-components/settings/Preferences';


export {
   EntrepriseManager,
   UserManager,
   ActiveProjects,
   TasksPerformance,
   SourceManager,
   GesChart,
   Teams,
   GazManager,
   SourcesChart,
   
   AboutMe,
   UserOverview,
   ActivityFeed,
   MyTeam,
   UserPrivilegies,
   ProfileHeader,
   UserBanner,
   EntrepriseDetail,
   EntrepriseCarbonDashboard,
   ProjectsContributions,
   PollutionsDetail,
   RecentFromBlog,

   CurrentPlan,
   BillingAddress,

   DeleteAccount, 
   EmailSetting,  
   GeneralSetting, 
   Notifications, 
   Preferences
};
