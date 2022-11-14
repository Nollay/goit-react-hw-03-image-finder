import axios from 'axios';

import React, { Component } from 'react';
import { LoadMore } from './Button/Button';
import { Gallery } from './ImageGallery/ImageGallery';
import { GalleryItem } from './ImageGalleryItem/ImageGalleryItem';
import { Loader } from './Loader/Loader';
import { ModalWindow } from './Modal/Modal';
import { Searchbar } from './Searchbar/Searchbar';
import toast, { Toaster } from 'react-hot-toast';

export class App extends Component {
  state = {
    images: [],
    searchQuery: '',
    page: 1,
    loadMoreButton: false,
    showModal: false,
    error: null,
    isLoading: false,
    modalURL: '',
    modalALT: '',
  };
  async componentDidUpdate(prevProps, prevState) {
    if (
      prevState.searchQuery !== this.state.searchQuery ||
      prevState.page !== this.state.page
    ) {
      try {
        this.setState({ isLoading: true });
        const response = await axios.get('https://pixabay.com/api/', {
          params: {
            key: '29947512-f3d06c4dc09f4cffc6828f6d0',
            q: this.state.searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: 12,
            page: this.state.page,
          },
        });
        this.setState(prevState => {
          return { images: [...prevState.images, ...response.data.hits] };
        });
        if (response.data.totalHits === 0) {
          toast.error('Nothing found.');
        }
        if (response.data.hits.length < 12) {
          this.setState({ loadMoreButton: false });
        } else {
          this.setState({ loadMoreButton: true });
        }
      } catch (error) {
        this.setState({ error: 'reloading the page' });
      } finally {
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, '200');
      }
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      searchQuery: e.target.elements.query.value,
      page: 1,
      images: [],
    });
    e.target.elements.query.value = '';
  };

  handleLoadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  toggleModal = (tag, img) => {
    this.setState(prev => ({
      showModal: !prev.showModal,
      modalURL: img,
      modalALT: tag,
    }));
  };

  render() {
    const {
      error,
      images,
      loadMoreButton,
      showModal,
      isLoading,
      modalURL,
      modalALT,
    } = this.state;
    const { handleSubmit, toggleModal, handleLoadMore } = this;
    return (
      <div>
        <Searchbar handleSubmit={handleSubmit} />
        {error && <div>{error}</div>}
        {isLoading && <Loader />}
        <Toaster position="top-right" reverseOrder={false} />
        <Gallery>
          <GalleryItem items={images} toggleModal={toggleModal} />
        </Gallery>
        {loadMoreButton && <LoadMore handleLoadMore={handleLoadMore} />}
        {showModal && (
          <ModalWindow onClose={toggleModal}>
            <img src={modalURL} alt={modalALT} />
          </ModalWindow>
        )}
      </div>
    );
  }
}
