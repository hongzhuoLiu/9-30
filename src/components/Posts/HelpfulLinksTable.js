import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleUIState } from "../../app/features/ui/UIReducer.js";
import BookmarkSelectedIcon from '../../images/icons/bookmark-selected.png'
import BookmarkIcon from '../../images/icons/bookmark-black.png'
import BookmarkDarkIcon from '../../images/icons/bookmark-grey-200.png'
import { useGetUserDetailsQuery, useUpdateUserProfileMutation } from '../../app/service/usersAPI'; 
import { setCredentials } from '../../app/features/authentication/AuthenticationReducer.js';

const ShareIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.1"
        stroke="currentColor"
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

function HelpfulLinksTable({ 
    helpfulLinks, 
    getIconURL, 
    shareIconId,
    onBookmarkChange,
    isProfileView = false
}) {
    const [links, setLinks] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    
    // Add these hooks for Redux pattern
    const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetailsQuery();
    const [updateUserProfile] = useUpdateUserProfileMutation();

useEffect(() => {
  if (helpfulLinks) {
    if (isProfileView) {
      // For profile view, check the structure of helpfulLinks
      try {
        const mapped = helpfulLinks.map(item => {
          // Check if linkName and linkUrl are directly on the item or within attributes
          const name = item.linkName || (item.attributes ? item.attributes.linkName : "Unknown Link");
          const link = item.linkUrl || (item.attributes ? item.attributes.linkUrl : "#");
          
          return {
            id: item.id,
            name: name,
            link: link,
            isBookmarked: true,
          };
        });
        console.log("Mapped links for profile view:", mapped);
        setLinks(mapped);
      } catch (error) {
        console.error("Error mapping links in profile view:", error);
        setLinks([]);
      }
    } else {
      // For regular view, check which links are bookmarked using Redux data
      const checkBookmarkStatus = () => {
        if (!user || !userDetails) {
          const mapped = helpfulLinks.map(item => ({
            id: item.id,
            name: item.attributes.linkName,
            link: item.attributes.linkUrl,
            isBookmarked: false,
          }));
          setLinks(mapped);
          return;
        }
        try {
          const bookmarkedLinks = userDetails.userHelpfulLinkBookmarks || [];
          const mapped = helpfulLinks.map(item => ({
            id: item.id,
            name: item.attributes.linkName,
            link: item.attributes.linkUrl,
            isBookmarked: bookmarkedLinks.some(bookmark => bookmark.id === item.id),
          }));
          setLinks(mapped);
        } catch (error) {
          console.error("Error checking bookmark status:", error);
          // Fallback
          const mapped = helpfulLinks.map(item => ({
            id: item.id,
            name: item.attributes.linkName,
            link: item.attributes.linkUrl,
            isBookmarked: false,
          }));
          setLinks(mapped);
        }
      };
      checkBookmarkStatus();
    }
  }
}, [helpfulLinks, user, isProfileView, userDetails]);

    // Bookmark function
    const handleBookmark = async (index) => {
    if (!user) {
        dispatch(toggleUIState({ key: 'showLoginPost' }));
        return;
    }
    
    const link = links[index];
    const newBookmarkStatus = !link.isBookmarked;
    
    try {
        // Update UI optimistically
        const currentLinks = [...links];
        currentLinks[index] = {
        ...currentLinks[index],
        isBookmarked: newBookmarkStatus
        };
        setLinks(currentLinks);

        // If we're in profile view and removing a bookmark
        if (isProfileView && !newBookmarkStatus) {
        // Notify parent component about bookmark removal
        if (onBookmarkChange) {
            onBookmarkChange(link.id, false);
        }
        return; // Parent handles the actual API call
        }
        // Update user's bookmarks using Redux pattern
        const updatedUser = { ...userDetails };
        let bookmarkedLinks = updatedUser.userHelpfulLinkBookmarks || [];

        if (newBookmarkStatus) {
        // Add bookmark
        bookmarkedLinks = [...bookmarkedLinks, { id: link.id }];
        } else {
        // Remove bookmark
        bookmarkedLinks = bookmarkedLinks.filter(bookmark => bookmark.id !== link.id);
        }
        updatedUser.userHelpfulLinkBookmarks = bookmarkedLinks;

        await updateUserProfile(updatedUser).unwrap();
        dispatch(setCredentials(updatedUser));
        refetchUserDetails();
        // Notify parent component about bookmark change
        if (onBookmarkChange) {
        onBookmarkChange(link.id, newBookmarkStatus);
        }
    } catch (error) {
        console.error("Error updating bookmark:", error);
        // Revert UI change on error
        const revertedLinks = [...links];
        revertedLinks[index] = {
        ...revertedLinks[index],
        isBookmarked: !newBookmarkStatus
        };
        setLinks(revertedLinks);
    }
};

    // Share function
    const handleShare = async (link) => {
    if (navigator.share) {
        try {
        await navigator.share({
            title: 'Check out this link!',
            url: link
        });
        } catch (err) {
        console.warn("User cancelled share or error:", err);
        }
    } else {
        alert(`Sharing link: ${link}`);
    }
    };

    if (!links || links.length === 0) {
    return (
        <div className="text-center py-10">
        <p className="text-gray-500 text-xl">
            {isProfileView ? "You haven't bookmarked any helpful links yet." : "No helpful links found."}
        </p>
        </div>
    );
    }

    return (
    <div className="mt-4 overflow-x-auto mb-10">
        <table className="table-auto w-full text-left border-collapse">
        <thead className="bg-sc-red text-white">
            <tr>
            <th className="p-2 whitespace-nowrap">Websites</th>
            <th className="p-2 whitespace-nowrap">Links</th>
            <th className="p-2 whitespace-nowrap w-[80px]" />
            </tr>
        </thead>
        <tbody>
            {links.map((item, index) => {
            const linkText = isMobile ? "Click here" : item.link;
            return (
                <tr
                key={item.id}
                className="bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                <td className="p-2 break-words">{item.name}</td>
                <td className="p-2">
                    <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-sc-red whitespace-nowrap dark:text-white"
                    >
                    {linkText}
                    </a>
                </td>
                <td className="p-2 w-[80px] flex items-center justify-center space-x-2">
                    {/* Bookmark */}
                    <button onClick={() => handleBookmark(index)}>
                    <img
                        src={item.isBookmarked ? BookmarkSelectedIcon : BookmarkIcon}
                        alt="Bookmark"
                        className="w-6 h-6 inline-block dark:hidden"
                    />
                    <img
                        src={item.isBookmarked ? BookmarkSelectedIcon : BookmarkDarkIcon}
                        alt="Bookmark"
                        className="w-6 h-6 dark:inline-block hidden"
                    />
                    </button>
                    {/* Share */}
                    <button onClick={() => handleShare(item.link)}>
                    {(
                        <ShareIcon className="w-6 h-6 text-black dark:text-gray-200" />
                    )}
                    </button>
                </td>
                </tr>
            );
            })}
        </tbody>
        </table>
    </div>
    );
}

export default HelpfulLinksTable;