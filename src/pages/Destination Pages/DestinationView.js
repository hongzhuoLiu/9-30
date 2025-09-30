import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../../API';
import InteractionArea from '../../components/Posts/InteractionArea';
import { useGetDestinationDetailsQuery } from '../../app/service/destinationsAPI';
import { useGetUserDetailsQuery, useUpdateUserProfileMutation } from '../../app/service/usersAPI';
import { toggleUIState } from '../../app/features/ui/UIReducer';
import { setCredentials } from '../../app/features/authentication/AuthenticationReducer';

import BookmarkDarkIcon from '../../images/icons/bookmark-grey-200.png';
import BookmarkSelectedIcon from '../../images/icons/bookmark-selected.png';
import BookmarkIcon from '../../images/icons/bookmark-black.png';
import BackIconDark from '../../images/icons/ChevronLeftDark.png';
import BackIconLight from '../../images/icons/ChevronLeft.png';
import LocationIcon from '../../images/icons/locationPin.png';
import LinkIcon from '../../images/icons/link.png';

function DestinationView() {
  const { idDestination } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;

  const { data: destination, isLoading } = useGetDestinationDetailsQuery(idDestination);
  const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetailsQuery();
  const [updateUserProfile] = useUpdateUserProfileMutation();

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (isLoggedIn && userDetails?.userDestinationLikes) {
      const liked = userDetails.userDestinationLikes.some((d) => parseInt(d.id) === parseInt(idDestination));
      setIsBookmarked(liked);
    } else {
      setIsBookmarked(false);
    }
  }, [userDetails, idDestination, isLoggedIn]);

  const handleAddBookmark = async () => {
    if (!isLoggedIn) {
      dispatch(toggleUIState({ key: 'showLoginPost' }));
      return;
    }

    const updatedUser = {
      ...userDetails,
      userDestinationLikes: [
        ...(userDetails.userDestinationLikes || []),
        { id: parseInt(idDestination) },
      ],
    };

    setIsBookmarked(true);
    await updateUserProfile(updatedUser).unwrap();
    dispatch(setCredentials(updatedUser));
    await refetchUserDetails();
  };

  const handleRemoveBookmark = async () => {
    if (!isLoggedIn) {
      dispatch(toggleUIState({ key: 'showLoginPost' }));
      return;
    }

    const updatedUser = {
      ...userDetails,
      userDestinationLikes: (userDetails.userDestinationLikes || []).filter(
        (d) => parseInt(d.id) !== parseInt(idDestination)
      ),
    };

    setIsBookmarked(false);
    await updateUserProfile(updatedUser).unwrap();
    dispatch(setCredentials(updatedUser));
    await refetchUserDetails();
  };

  if (isLoading || !destination) return <div>Loading...</div>;

  const dest = destination.attributes;

  const getImageUrl = (formats) => {
    return formats?.large?.url || formats?.medium?.url || formats?.small?.url || formats?.thumbnail?.url || null;
  };

  const bannerImgUrl = getImageUrl(dest.destinationHeaderImage?.data?.attributes?.formats);

  return (
    <div className="relative m-0 bg-white dark:bg-gray-900">
      <div className="h-full flex items-start justify-between mt-2 ml-4 mr-4 mb-4">
        <div className="flex flex-col items-start gap-1 w-full sm:w-4/5">
          <div className="flex items-center gap-x-4">
            <button onClick={() => navigate('/destinations')}>
              <img className="h-[8vh] hidden dark:block" src={BackIconDark} alt="Back icon dark" />
              <img className="h-[7vh] block dark:hidden" src={BackIconLight} alt="Back icon light" />
            </button>
            <h1 className="titleTextPrimary sm:ml-4">Destinations</h1>
          </div>
          <div className="flex items-center mt-4 gap-x-4 sm:ml-12">
            <h1 className="font-bold text-4xl sm:text-4xl 2xl:text-6xl text-gray-600 dark:text-gray-200">
              {dest.destinationName}
            </h1>
            {isLoggedIn && (
              <button onClick={isBookmarked ? handleRemoveBookmark : handleAddBookmark}>
                <img
                  src={isBookmarked ? BookmarkSelectedIcon : BookmarkIcon}
                  alt="Bookmark"
                  className="w-11 h-11 dark:hidden"
                />
                <img
                  src={isBookmarked ? BookmarkSelectedIcon : BookmarkDarkIcon}
                  alt="Bookmark"
                  className="w-11 h-11 hidden dark:block"
                />
              </button>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-x-10 mt-4 sm:ml-12">
            <div className="flex items-center">
              <img className="w-7 h-7 mr-2" src={LocationIcon} alt="Location icon" />
              <p className="font-bold text-xl sm:text-2xl 2xl:text-4xl text-gray-500 dark:text-gray-300">
                {dest.destinationLocation}
              </p>
            </div>
            <div className="flex items-center">
              <img className="w-7 h-7 mr-2" src={LinkIcon} alt="Link icon" />
              <a
                href={dest.webpage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-300 underline font-bold text-xl sm:text-2xl 2xl:text-4xl"
              >
                {dest.webpageName}
              </a>
            </div>
          </div>
          <div className="flex items-center sm:hidden mt-4">
            <img className="w-7 h-7 mr-2" src={LocationIcon} alt="Location icon" />
            <p className="font-bold text-xl sm:text-2xl 2xl:text-4xl text-gray-500 dark:text-gray-300">
              {dest.destinationLocation}
            </p>
          </div>
          <div className="flex items-center sm:hidden">
            <img className="w-7 h-7 mr-2" src={LinkIcon} alt="Link icon" />
            <a
              href={dest.webpage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-300 underline font-bold text-xl sm:text-2xl 2xl:text-4xl"
            >
              {dest.webpageName}
            </a>
          </div>
        </div>
      </div>

      <div className="min-h-[300px] w-11/12 mx-auto">
        {bannerImgUrl ? (
          <img
            src={BASE_URL + bannerImgUrl}
            alt="Banner"
            className="w-screen h-[55vh] object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-[55vh] bg-gray-300 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300">
            No image available
          </div>
        )}
      </div>

      <InteractionArea interactionName={`destination-pages/${idDestination}`} />
    </div>
  );
}

export default DestinationView;
